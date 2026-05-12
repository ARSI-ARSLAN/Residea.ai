"""
Admin configuration for properties app
"""
from django.contrib import admin
from .models import Property, PropertyImage, PropertyFeature


@admin.register(Property)
class PropertyAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'location', 'price', 'bedrooms', 'bathrooms', 'verified', 'is_active', 'created_at']
    list_filter = ['verified', 'is_active', 'is_featured', 'property_type', 'created_at']
    search_fields = ['title', 'location', 'description']
    readonly_fields = ['created_at', 'updated_at', 'views_count']
    list_editable = ['verified', 'is_active']
    date_hierarchy = 'created_at'
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('title', 'link', 'location', 'price', 'property_type', 'description')
        }),
        ('Property Details', {
            'fields': ('bedrooms', 'bathrooms', 'area_sqft', 'main_image')
        }),
        ('Location Scores', {
            'fields': ('hospital_score', 'school_score', 'restaurant_score',
                      'shopping_mall_score', 'park_score', 'metro_score'),
            'classes': ('collapse',)
        }),
        ('Distances', {
            'fields': ('dist_to_hospital', 'dist_to_school', 'dist_to_restaurant',
                      'dist_to_shopping_mall', 'dist_to_park', 'dist_to_metro'),
            'classes': ('collapse',)
        }),
        ('Status', {
            'fields': ('verified', 'is_active', 'is_featured', 'owner')
        }),
        ('Metadata', {
            'fields': ('views_count', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(PropertyImage)
class PropertyImageAdmin(admin.ModelAdmin):
    list_display = ['id', 'property', 'caption', 'order', 'uploaded_at']
    list_filter = ['uploaded_at']
    search_fields = ['property__title', 'caption']


@admin.register(PropertyFeature)
class PropertyFeatureAdmin(admin.ModelAdmin):
    list_display = ['id', 'property', 'name']
    search_fields = ['property__title', 'name']
