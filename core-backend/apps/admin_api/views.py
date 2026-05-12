"""
Views for admin API — full CRUD operations for properties and users.
All views require staff/superuser authentication via IsAdminOrStaff.
"""
import csv
import io
import logging
from datetime import timedelta

from django.contrib.auth import get_user_model
from django.db.models import Count, Sum, Q
from django.http import HttpResponse
from django.utils import timezone
from rest_framework import viewsets, filters, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django_filters.rest_framework import DjangoFilterBackend

from apps.properties.models import Property, PropertyImage, PropertyFeature
from apps.users.models import SavedProperty, PropertyView

from .permissions import IsAdminOrStaff
from .serializers import (
    AdminPropertyListSerializer,
    AdminPropertyDetailSerializer,
    AdminPropertyCreateUpdateSerializer,
    AdminUserListSerializer,
    AdminUserDetailSerializer,
    AdminUserUpdateSerializer,
    AdminDashboardStatsSerializer,
)
from .filters import AdminPropertyFilter, AdminUserFilter

User = get_user_model()
logger = logging.getLogger(__name__)


# ─── Admin Property CRUD ───────────────────────────────────────────────

class AdminPropertyViewSet(viewsets.ModelViewSet):
    """
    Admin CRUD for properties.
    Lists ALL properties (including inactive), full field access.

    Endpoints:
        GET    /api/admin/properties/              — List all
        POST   /api/admin/properties/              — Create
        GET    /api/admin/properties/{id}/          — Detail
        PUT    /api/admin/properties/{id}/          — Full update
        PATCH  /api/admin/properties/{id}/          — Partial update
        DELETE /api/admin/properties/{id}/          — Delete
        POST   /api/admin/properties/{id}/verify/   — Toggle verified
        POST   /api/admin/properties/{id}/feature/  — Toggle featured
        GET    /api/admin/properties/export/         — Export CSV
    """
    permission_classes = [IsAdminOrStaff]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = AdminPropertyFilter
    search_fields = ['title', 'location', 'description', 'property_type']
    ordering_fields = [
        'price', 'created_at', 'updated_at', 'area_sqft',
        'views_count', 'bedrooms', 'verified', 'is_active',
    ]
    ordering = ['-created_at']

    def get_queryset(self):
        """Return ALL properties — admin sees everything including inactive."""
        return Property.objects.all().select_related('owner').prefetch_related('images', 'features')

    def get_serializer_class(self):
        if self.action == 'list':
            return AdminPropertyListSerializer
        elif self.action in ['create', 'update', 'partial_update']:
            return AdminPropertyCreateUpdateSerializer
        return AdminPropertyDetailSerializer

    def perform_destroy(self, instance):
        """Log deletion and delete."""
        logger.info(
            f"Admin {self.request.user.email} deleted property "
            f"#{instance.id} '{instance.title}' at {instance.location}"
        )
        instance.delete()

    @action(detail=True, methods=['post'])
    def verify(self, request, pk=None):
        """Toggle property verified status."""
        prop = self.get_object()
        prop.verified = not prop.verified
        prop.save(update_fields=['verified'])
        logger.info(
            f"Admin {request.user.email} {'verified' if prop.verified else 'unverified'} "
            f"property #{prop.id}"
        )
        return Response({
            'id': prop.id,
            'verified': prop.verified,
            'message': f"Property {'verified' if prop.verified else 'unverified'} successfully."
        })

    @action(detail=True, methods=['post'])
    def feature(self, request, pk=None):
        """Toggle property featured status."""
        prop = self.get_object()
        prop.is_featured = not prop.is_featured
        prop.save(update_fields=['is_featured'])
        logger.info(
            f"Admin {request.user.email} {'featured' if prop.is_featured else 'unfeatured'} "
            f"property #{prop.id}"
        )
        return Response({
            'id': prop.id,
            'is_featured': prop.is_featured,
            'message': f"Property {'featured' if prop.is_featured else 'unfeatured'} successfully."
        })

    @action(detail=True, methods=['post'])
    def toggle_active(self, request, pk=None):
        """Toggle property active status."""
        prop = self.get_object()
        prop.is_active = not prop.is_active
        prop.save(update_fields=['is_active'])
        logger.info(
            f"Admin {request.user.email} {'activated' if prop.is_active else 'deactivated'} "
            f"property #{prop.id}"
        )
        return Response({
            'id': prop.id,
            'is_active': prop.is_active,
            'message': f"Property {'activated' if prop.is_active else 'deactivated'} successfully."
        })

    @action(detail=False, methods=['get'])
    def export(self, request):
        """Export all properties as CSV."""
        properties = self.filter_queryset(self.get_queryset())

        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="properties_export.csv"'

        writer = csv.writer(response)
        writer.writerow([
            'ID', 'Title', 'Location', 'Price', 'Property Type',
            'Bedrooms', 'Bathrooms', 'Area (sqft)',
            'Verified', 'Active', 'Featured',
            'Views', 'Owner Email', 'Created At',
        ])

        for prop in properties:
            writer.writerow([
                prop.id, prop.title, prop.location, prop.price, prop.property_type,
                prop.bedrooms, prop.bathrooms, prop.area_sqft,
                prop.verified, prop.is_active, prop.is_featured,
                prop.views_count,
                prop.owner.email if prop.owner else '',
                prop.created_at.strftime('%Y-%m-%d %H:%M'),
            ])

        logger.info(f"Admin {request.user.email} exported {properties.count()} properties")
        return response

    @action(detail=False, methods=['post'])
    def bulk_action(self, request):
        """
        Perform bulk actions on selected properties.
        Body: { "ids": [1, 2, 3], "action": "verify|unverify|activate|deactivate|delete" }
        """
        ids = request.data.get('ids', [])
        bulk_action = request.data.get('action', '')

        if not ids:
            return Response({'error': 'No property IDs provided.'}, status=status.HTTP_400_BAD_REQUEST)

        properties = Property.objects.filter(id__in=ids)
        count = properties.count()

        if bulk_action == 'verify':
            properties.update(verified=True)
        elif bulk_action == 'unverify':
            properties.update(verified=False)
        elif bulk_action == 'activate':
            properties.update(is_active=True)
        elif bulk_action == 'deactivate':
            properties.update(is_active=False)
        elif bulk_action == 'delete':
            properties.delete()
        else:
            return Response(
                {'error': f'Unknown action: {bulk_action}'},
                status=status.HTTP_400_BAD_REQUEST
            )

        logger.info(f"Admin {request.user.email} bulk {bulk_action} on {count} properties")
        return Response({
            'message': f"Successfully applied '{bulk_action}' to {count} properties.",
            'affected_count': count,
        })


# ─── Admin User CRUD ───────────────────────────────────────────────────

class AdminUserViewSet(viewsets.ModelViewSet):
    """
    Admin CRUD for users.
    Lists ALL users, can edit roles and status.

    Endpoints:
        GET    /api/admin/users/                     — List all
        GET    /api/admin/users/{id}/                — Detail
        PATCH  /api/admin/users/{id}/                — Update
        DELETE /api/admin/users/{id}/                — Soft delete (deactivate)
        POST   /api/admin/users/{id}/toggle_active/  — Toggle active
        POST   /api/admin/users/{id}/make_staff/     — Toggle staff status
    """
    permission_classes = [IsAdminOrStaff]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_class = AdminUserFilter
    search_fields = ['email', 'first_name', 'last_name', 'username']
    ordering_fields = [
        'date_joined', 'last_active', 'email', 'first_name',
        'user_type', 'is_active', 'is_staff',
    ]
    ordering = ['-date_joined']

    def get_queryset(self):
        """Return ALL users."""
        return User.objects.all().prefetch_related('owned_properties', 'saved_properties')

    def get_serializer_class(self):
        if self.action == 'list':
            return AdminUserListSerializer
        elif self.action in ['update', 'partial_update']:
            return AdminUserUpdateSerializer
        return AdminUserDetailSerializer

    def destroy(self, request, *args, **kwargs):
        """Soft delete — deactivate user instead of hard delete."""
        user = self.get_object()

        # Prevent deleting yourself or other superusers
        if user == request.user:
            return Response(
                {'error': 'You cannot deactivate your own account.'},
                status=status.HTTP_400_BAD_REQUEST
            )
        if user.is_superuser and not request.user.is_superuser:
            return Response(
                {'error': 'Only superusers can deactivate other superuser accounts.'},
                status=status.HTTP_403_FORBIDDEN
            )

        user.is_active = False
        user.save(update_fields=['is_active'])
        logger.info(f"Admin {request.user.email} deactivated user {user.email}")
        return Response({
            'message': f"User {user.email} has been deactivated.",
            'id': user.id,
            'is_active': False,
        })

    @action(detail=True, methods=['post'])
    def toggle_active(self, request, pk=None):
        """Toggle user active/suspended status."""
        user = self.get_object()

        if user == request.user:
            return Response(
                {'error': 'You cannot change your own active status.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user.is_active = not user.is_active
        user.save(update_fields=['is_active'])
        logger.info(
            f"Admin {request.user.email} {'activated' if user.is_active else 'suspended'} "
            f"user {user.email}"
        )
        return Response({
            'id': user.id,
            'is_active': user.is_active,
            'message': f"User {'activated' if user.is_active else 'suspended'} successfully."
        })

    @action(detail=True, methods=['post'])
    def make_staff(self, request, pk=None):
        """Toggle user staff/admin status."""
        user = self.get_object()

        if user == request.user:
            return Response(
                {'error': 'You cannot change your own staff status.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        user.is_staff = not user.is_staff
        user.save(update_fields=['is_staff'])
        logger.info(
            f"Admin {request.user.email} {'promoted' if user.is_staff else 'demoted'} "
            f"user {user.email}"
        )
        return Response({
            'id': user.id,
            'is_staff': user.is_staff,
            'message': f"User {'promoted to staff' if user.is_staff else 'removed from staff'} successfully."
        })


# ─── Admin Dashboard ───────────────────────────────────────────────────

class AdminDashboardView(APIView):
    """
    GET /api/admin/dashboard/
    Returns aggregated statistics for the admin dashboard.
    """
    permission_classes = [IsAdminOrStaff]

    def get(self, request):
        now = timezone.now()
        thirty_days_ago = now - timedelta(days=30)

        # Property stats
        total_properties = Property.objects.count()
        active_properties = Property.objects.filter(is_active=True).count()
        verified_properties = Property.objects.filter(verified=True).count()
        featured_properties = Property.objects.filter(is_featured=True).count()

        # User stats
        total_users = User.objects.count()
        active_users = User.objects.filter(is_active=True).count()
        staff_users = User.objects.filter(is_staff=True).count()
        new_users_30d = User.objects.filter(date_joined__gte=thirty_days_ago).count()

        # Activity stats
        total_property_views = PropertyView.objects.count()
        total_saved_properties = SavedProperty.objects.count()

        # Properties by type breakdown
        type_counts = (
            Property.objects
            .values('property_type')
            .annotate(count=Count('id'))
            .order_by('-count')
        )
        properties_by_type = {
            item['property_type'] or 'Unknown': item['count']
            for item in type_counts
        }

        # Recent items
        recent_users = User.objects.order_by('-date_joined')[:5]
        recent_properties = Property.objects.order_by('-created_at')[:5]

        data = {
            'total_properties': total_properties,
            'active_properties': active_properties,
            'verified_properties': verified_properties,
            'featured_properties': featured_properties,
            'total_users': total_users,
            'active_users': active_users,
            'staff_users': staff_users,
            'new_users_30d': new_users_30d,
            'total_property_views': total_property_views,
            'total_saved_properties': total_saved_properties,
            'properties_by_type': properties_by_type,
            'recent_users': AdminUserListSerializer(recent_users, many=True).data,
            'recent_properties': AdminPropertyListSerializer(recent_properties, many=True).data,
        }

        return Response(data)
