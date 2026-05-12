"""
Views for Property API
"""
import os
import uuid
from django.conf import settings
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly, AllowAny
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Q

from .models import Property, PropertyImage
from apps.preferences.models import UserPreference
from .serializers import (
    PropertyListSerializer,
    PropertyDetailSerializer,
    PropertyCreateSerializer,
    PropertyRecommendationSerializer
)
from .filters import PropertyFilter


class PropertyViewSet(viewsets.ModelViewSet):
    """
    API endpoints for properties.
    Public read access, authenticated write access.
    """
    queryset = Property.objects.filter(is_active=True).prefetch_related('images', 'features')
    permission_classes = [IsAuthenticatedOrReadOnly]
    parser_classes = [JSONParser, MultiPartParser, FormParser]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = PropertyFilter
    search_fields = ['location', 'description', 'title']
    ordering_fields = ['price', 'created_at', 'area_sqft', 'views_count']
    ordering = ['-created_at']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return PropertyListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return PropertyCreateSerializer
        return PropertyDetailSerializer
    
    def retrieve(self, request, *args, **kwargs):
        """Override retrieve to increment view count"""
        instance = self.get_object()
        instance.increment_views()
        
        # Track view in PropertyView model
        from apps.users.models import PropertyView
        PropertyView.objects.create(
            user=request.user if request.user.is_authenticated else None,
            property=instance,
            ip_address=request.META.get('REMOTE_ADDR'),
            user_agent=request.META.get('HTTP_USER_AGENT', '')
        )
        
        serializer = self.get_serializer(instance)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def roi_estimate(self, request, pk=None):
        """
        GET /api/properties/{id}/roi_estimate/
        Get ROI prediction for a property
        """
        property_obj = self.get_object()
        
        from apps.ml_services.roi_predictor import ROIPredictor
        predictor = ROIPredictor()
        roi_data = predictor.predict_roi(property_obj)
        
        return Response(roi_data)
    




# Update to PropertyViewSet recommendations method
    @action(detail=False, methods=['post', 'get'], permission_classes=[AllowAny])
    def recommendations(self, request):
        """
        POST/GET /api/properties/recommendations/
        Get personalized property recommendations using ML based on stored preferences
        """
        import logging
        import json
        logger = logging.getLogger(__name__)
        
        # Get limit from request
        if request.method == 'POST':
            limit = request.data.get('limit', 5)
            user_id = request.data.get('user_id')
        else:
            limit = int(request.query_params.get('limit', 5))
            user_id = request.query_params.get('user_id')
        
        # Apply filters if provided
        queryset = self.filter_queryset(self.get_queryset())
        
        # Get user preferences
        user_prefs = None
        if request.user.is_authenticated:
            user_prefs = UserPreference.objects.filter(user=request.user).first()
            logger.info(f"Using preferences for authenticated user: {request.user.id}")
        elif user_id:
            user_prefs = UserPreference.objects.filter(user_id=user_id).first()
            logger.info(f"Using preferences for user_id: {user_id}")
            
        # Use ML ranker to rank properties
        from apps.ml_services.ranker import PropertyRanker
        from apps.ml_services.roi_predictor import ROIPredictor
        
        ranker = PropertyRanker()
        roi_predictor = ROIPredictor()
        
        # Personalized recommendations using ML
        if user_prefs:
            logger.info(f"User preferences: city={user_prefs.city}, budget={user_prefs.min_budget}-{user_prefs.max_budget}, locations={user_prefs.preferred_locations}")
            # Filter queryset based on hard constraints first (optional, but good for performance)
            # We can be lenient here to allow ML to do the heavy lifting
            
            # Use ML ranker with preferences
            # Since ranker expects a user object, we might need to adapt it
            # or pass the preferences directly if the ranker supports it.
            # For now, let's adapt the ranker call or implementation.
            
            # If the ranker strictly needs a user object, we might need to mock it or update the ranker.
            # Assuming ranker.rank_properties takes a user and queryset.
            
            # Let's filter manually based on preferences first to narrow down candidates
            # Apply budget filter (±20% buffer)
            budget_buffer = 0.2
            min_price = float(user_prefs.min_budget) * (1 - budget_buffer) if user_prefs.min_budget else 0
            max_price = float(user_prefs.max_budget) * (1 + budget_buffer) if user_prefs.max_budget else float('inf')
            
            candidates = queryset.filter(
                price__gte=min_price,
                price__lte=max_price
            )
            
            # Filter by bedrooms (±1 tolerance)
            if user_prefs.bedrooms:
                candidates = candidates.filter(
                    bedrooms__gte=max(1, user_prefs.bedrooms - 1),
                    bedrooms__lte=user_prefs.bedrooms + 1
                )
            
            # Filter by preferred locations if specified
            if user_prefs.preferred_locations:
                from django.db.models import Q
                location_query = Q()
                for loc in user_prefs.preferred_locations:
                    if loc:  # Skip empty strings
                        location_query |= Q(location__icontains=loc.strip())
                if location_query:
                    candidates = candidates.filter(location_query)
            
            # Filter by property types if specified
            if user_prefs.property_types:
                candidates = candidates.filter(property_type__in=user_prefs.property_types)
            
            logger.info(f"After filtering: {candidates.count()} properties match user preferences")
            
            # If no candidates after filtering, relax location constraint
            if candidates.count() == 0 and user_prefs.preferred_locations:
                logger.warning("No properties found with location filter, relaxing constraint")
                candidates = queryset.filter(
                    price__gte=min_price,
                    price__lte=max_price
                )
                if user_prefs.bedrooms:
                    candidates = candidates.filter(
                        bedrooms__gte=max(1, user_prefs.bedrooms - 1),
                        bedrooms__lte=user_prefs.bedrooms + 1
                    )
            
            # Use ML PropertyRanker to score properties
            logger.info(f"Using ML PropertyRanker to score {candidates.count()} candidate properties")
            
            # Create a mock user object for the ranker
            class MockUser:
                def __init__(self, prefs):
                    self.id = prefs.user_id if hasattr(prefs, 'user_id') else 'unknown'
                    self.preferences = prefs  # Direct access via OneToOne relationship
            
            mock_user = MockUser(user_prefs)
            
            # Rank properties using ML model
            ranked_properties = ranker.rank_properties(mock_user, candidates[:100])  # Limit to 100 for performance
            
            logger.info(f"ML Ranker returned {len(ranked_properties)} scored properties")
            
            # Log top recommendations as JSON
            top_recs_log = []
            for prop, score in ranked_properties[:limit]:
                top_recs_log.append({
                    'property_id': prop.id,
                    'title': prop.title,
                    'location': prop.location,
                    'price': float(prop.price),
                    'bedrooms': prop.bedrooms,
                    'ml_score': float(score),
                    'match_percentage': int(min(score * 10, 99))
                })
            
            logger.info(f"TOP {limit} ML RECOMMENDATIONS (JSON):\n{json.dumps(top_recs_log, indent=2)}")
            
        else:
            # No preferences, use fallback (popularity-based)
            logger.info("No user preferences found, using fallback ranking (popularity-based)")
            properties_to_rank = queryset.order_by('-views_count', '-created_at')[:limit*2]
            ranked_properties = [(prop, 5.0) for prop in properties_to_rank]  # Base score for all
        
        # Get top N
        top_properties = ranked_properties[:limit]
        
        # Get ROI estimates and format response
        results = []
        for prop, score in top_properties:
            roi_data = roi_predictor.predict_roi(prop)
            property_data = PropertyListSerializer(prop).data
            results.append({
                'property': property_data,
                'score': float(score),
                'match_percentage': int(min(score * 10, 99)),
                'roi_1yr': round(roi_data.get('roi_1yr', 0) * 100, 2),  # Convert to percentage
                'roi_5yr': round(roi_data.get('roi_5yr', 0) * 100, 2),  # Convert to percentage
            })
        
        logger.info(f"Returning {len(results)} recommendations to frontend")
        
        return Response({
            'count': len(results),
            'properties': results
        })
    
    @action(detail=False, methods=['get'])
    def featured(self, request):
        """
        GET /api/properties/featured/
        Get featured properties
        """
        featured = self.get_queryset().filter(is_featured=True)[:10]
        serializer = PropertyListSerializer(featured, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def similar(self, request):
        """
        GET /api/properties/similar/?property_id=123
        Get similar properties based on location and price
        """
        property_id = request.query_params.get('property_id')
        if not property_id:
            return Response(
                {'error': 'property_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            reference_property = Property.objects.get(id=property_id)
        except Property.DoesNotExist:
            return Response(
                {'error': 'Property not found'},
                status=status.HTTP_404_NOT_FOUND
            )
        
        # Find similar properties
        price_range = float(reference_property.price) * 0.2  # 20% range
        similar = self.get_queryset().filter(
            Q(location__icontains=reference_property.location.split(',')[0]) |
            Q(bedrooms=reference_property.bedrooms),
            price__gte=float(reference_property.price) - price_range,
            price__lte=float(reference_property.price) + price_range
        ).exclude(id=property_id)[:10]
        
        serializer = PropertyListSerializer(similar, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_listings(self, request):
        """
        GET /api/properties/my_listings/
        Get properties listed by the authenticated user
        """
        properties = Property.objects.filter(owner=request.user).order_by('-created_at')
        serializer = PropertyListSerializer(properties, many=True)
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        """Only allow owners to delete their properties"""
        instance = self.get_object()
        if instance.owner != request.user and not request.user.is_staff:
            return Response(
                {'error': 'You can only delete your own listings'},
                status=status.HTTP_403_FORBIDDEN
            )
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)

    @action(detail=False, methods=['get'], permission_classes=[AllowAny])
    def locations(self, request):
        """
        GET /api/properties/locations/?q=search_term
        Get unique locations for autocomplete
        """
        search_term = request.query_params.get('q', '').strip()
        
        # Get unique locations from database
        locations_qs = Property.objects.filter(is_active=True).values_list('location', flat=True).distinct()
        
        # Filter by search term if provided
        if search_term:
            locations = [loc for loc in locations_qs if loc and search_term.lower() in loc.lower()]
        else:
            locations = [loc for loc in locations_qs if loc]
        
        # Return unique, sorted locations (limit to 50)
        unique_locations = sorted(set(locations))[:50]
        
        return Response({
            'locations': unique_locations,
            'count': len(unique_locations)
        })

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated],
            parser_classes=[MultiPartParser, FormParser])
    def upload_images(self, request, pk=None):
        """
        POST /api/properties/{id}/upload_images/
        Upload images for a property (multipart/form-data)
        Accepts multiple files under 'images' key
        """
        from .serializers import PropertyImageSerializer

        property_obj = self.get_object()

        # Check ownership
        if property_obj.owner != request.user and not request.user.is_staff:
            return Response(
                {'error': 'You can only upload images to your own listings'},
                status=status.HTTP_403_FORBIDDEN
            )

        files = request.FILES.getlist('images')
        if not files:
            return Response(
                {'error': 'No images provided. Send files with key "images"'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Ensure upload directory exists
        upload_dir = os.path.join(settings.MEDIA_ROOT, 'property_images')
        os.makedirs(upload_dir, exist_ok=True)

        created_images = []
        existing_count = property_obj.images.count()

        for idx, file in enumerate(files):
            # Validate file type
            if not file.content_type.startswith('image/'):
                continue

            # Generate unique filename
            ext = os.path.splitext(file.name)[1] or '.jpg'
            filename = f'{property_obj.id}_{uuid.uuid4().hex[:8]}{ext}'
            filepath = os.path.join(upload_dir, filename)

            # Save file
            with open(filepath, 'wb+') as dest:
                for chunk in file.chunks():
                    dest.write(chunk)

            # Build URL
            image_url = f'{request.scheme}://{request.get_host()}/{settings.MEDIA_URL}property_images/{filename}'

            # Create PropertyImage record
            img = PropertyImage.objects.create(
                property=property_obj,
                image_url=image_url,
                caption=f'Photo {existing_count + idx + 1}',
                order=existing_count + idx,
            )
            created_images.append(img)

            # Set first uploaded image as main_image if none exists
            if not property_obj.main_image and idx == 0:
                property_obj.main_image = image_url
                property_obj.save(update_fields=['main_image'])

        serializer = PropertyImageSerializer(created_images, many=True)
        return Response({
            'uploaded': len(created_images),
            'images': serializer.data
        }, status=status.HTTP_201_CREATED)

    @action(detail=True, methods=['get'], permission_classes=[AllowAny])
    def gallery(self, request, pk=None):
        """
        GET /api/properties/{id}/gallery/
        Get all images for a property
        """
        from .serializers import PropertyImageSerializer
        property_obj = self.get_object()
        images = property_obj.images.all().order_by('order')
        serializer = PropertyImageSerializer(images, many=True)
        return Response({
            'main_image': property_obj.main_image,
            'images': serializer.data,
            'count': images.count()
        })
