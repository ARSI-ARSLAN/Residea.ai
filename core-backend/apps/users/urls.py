"""
URL configuration for users app
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    RegisterView,
    LoginView,
    UserProfileView,
    SavedPropertyViewSet
)

router = DefaultRouter()
router.register(r'saved-properties', SavedPropertyViewSet, basename='saved-property')

urlpatterns = [
    # Authentication
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # User Profile
    path('profile/', UserProfileView.as_view(), name='user-profile'),
    
    # Router URLs
    path('', include(router.urls)),
]
