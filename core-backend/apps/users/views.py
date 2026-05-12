"""
Views for user authentication and profile management
"""
from rest_framework import generics, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import get_user_model

from .models import SavedProperty
from .serializers import (
    UserRegistrationSerializer,
    CustomTokenObtainPairSerializer,
    UserProfileSerializer,
    UserUpdateSerializer,
    SavedPropertySerializer
)

User = get_user_model()


class RegisterView(generics.CreateAPIView):
    """
    API endpoint for user registration
    POST /api/auth/register/
    """
    queryset = User.objects.all()
    permission_classes = [AllowAny]
    serializer_class = UserRegistrationSerializer
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        
        # Generate tokens for the new user
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'user': UserProfileSerializer(user).data,
            'tokens': {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            },
            'message': 'User registered successfully'
        }, status=status.HTTP_201_CREATED)


class LoginView(TokenObtainPairView):
    """
    API endpoint for user login
    POST /api/auth/login/
    """
    serializer_class = CustomTokenObtainPairSerializer
    permission_classes = [AllowAny]


class UserProfileView(generics.RetrieveUpdateAPIView):
    """
    API endpoint for user profile
    GET /api/users/profile/
    PUT /api/users/profile/
    PATCH /api/users/profile/
    """
    serializer_class = UserProfileSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        return self.request.user
    
    def get_serializer_class(self):
        if self.request.method in ['PUT', 'PATCH']:
            return UserUpdateSerializer
        return UserProfileSerializer


class SavedPropertyViewSet(viewsets.ModelViewSet):
    """
    API endpoints for saved properties
    GET /api/users/saved-properties/
    POST /api/users/saved-properties/
    DELETE /api/users/saved-properties/{id}/
    """
    serializer_class = SavedPropertySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return SavedProperty.objects.filter(user=self.request.user).select_related('property')
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    @action(detail=False, methods=['post'])
    def toggle(self, request):
        """
        Toggle save status for a property
        POST /api/users/saved-properties/toggle/
        Body: {"property_id": 123}
        """
        property_id = request.data.get('property_id')
        if not property_id:
            return Response(
                {'error': 'property_id is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        saved_property, created = SavedProperty.objects.get_or_create(
            user=request.user,
            property_id=property_id
        )
        
        if not created:
            saved_property.delete()
            return Response({
                'message': 'Property unsaved',
                'saved': False
            })
        
        return Response({
            'message': 'Property saved',
            'saved': True,
            'data': SavedPropertySerializer(saved_property).data
        }, status=status.HTTP_201_CREATED)
