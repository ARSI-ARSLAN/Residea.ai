"""
URL configuration for admin API.
All endpoints are prefixed with /api/admin/ (set in main urls.py).
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import (
    AdminPropertyViewSet,
    AdminUserViewSet,
    AdminDashboardView,
)

router = DefaultRouter()
router.register(r'properties', AdminPropertyViewSet, basename='admin-property')
router.register(r'users', AdminUserViewSet, basename='admin-user')

urlpatterns = [
    path('dashboard/', AdminDashboardView.as_view(), name='admin-dashboard'),
    path('', include(router.urls)),
]
