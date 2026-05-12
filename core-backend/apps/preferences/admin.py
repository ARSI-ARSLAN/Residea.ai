"""
Admin configuration for preferences app
"""
from django.contrib import admin
from .models import UserPreference


@admin.register(UserPreference)
class UserPreferenceAdmin(admin.ModelAdmin):
    list_display = ['user', 'min_budget', 'max_budget', 'purpose', 'updated_at']
    list_filter = ['purpose', 'updated_at']
    search_fields = ['user__email', 'user__username']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('User', {
            'fields': ('user',)
        }),
        ('Budget', {
            'fields': ('min_budget', 'max_budget')
        }),
        ('Property Requirements', {
            'fields': ('min_bedrooms', 'max_bedrooms', 'min_bathrooms', 'min_area_sqft',
                      'property_types', 'purpose', 'preferred_locations')
        }),
        ('Amenity Importance', {
            'fields': ('hospital_importance', 'school_importance', 'restaurant_importance',
                      'shopping_importance', 'park_importance', 'metro_importance',
                      'security_importance', 'parking_importance'),
            'classes': ('collapse',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
