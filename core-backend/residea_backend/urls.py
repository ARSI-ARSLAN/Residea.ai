"""
URL configuration for residea_backend project.
"""
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework import permissions
from drf_yasg.views import get_schema_view
from drf_yasg import openapi

# Swagger/OpenAPI Schema
schema_view = get_schema_view(
    openapi.Info(
        title="Residea.ai API",
        default_version='v1',
        description="AI-powered real estate platform API with ML-based property recommendations and ROI predictions",
        terms_of_service="https://www.residea.ai/terms/",
        contact=openapi.Contact(email="contact@residea.ai"),
        license=openapi.License(name="Proprietary License"),
    ),
    public=True,
    permission_classes=[permissions.AllowAny],
)

urlpatterns = [
    # Admin
    path('admin/', admin.site.urls),
    
    # API Documentation
    path('swagger/', schema_view.with_ui('swagger', cache_timeout=0), name='schema-swagger-ui'),
    path('redoc/', schema_view.with_ui('redoc', cache_timeout=0), name='schema-redoc'),
    path('api/schema/', schema_view.without_ui(cache_timeout=0), name='schema-json'),
    
    # API Endpoints
    path('api/auth/', include('apps.users.urls')),
    path('api/properties/', include('apps.properties.urls')),
    path('api/preferences/', include('apps.preferences.urls')),
    path('api/ml/', include('apps.ml_services.urls')),

    # Admin API (separate from Django admin)
    path('api/admin/', include('apps.admin_api.urls')),
]

# Serve media files in development
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
