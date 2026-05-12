"""
URL configuration for ML services
"""
from django.urls import path
from .views import MLHealthCheckView

urlpatterns = [
    path('health/', MLHealthCheckView.as_view(), name='ml-health'),
]
