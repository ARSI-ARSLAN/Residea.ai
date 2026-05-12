"""
Admin configuration for users app
"""
from django.contrib import admin
from django.contrib.auth.admin import UserAdmin as BaseUserAdmin
from .models import User, SavedProperty, PropertyView


@admin.register(User)
class UserAdmin(BaseUserAdmin):
    list_display = ['email', 'username', 'first_name', 'last_name', 'user_type', 'is_staff', 'created_at']
    list_filter = ['user_type', 'is_staff', 'is_active', 'has_completed_onboarding']
    search_fields = ['email', 'username', 'first_name', 'last_name', 'phone_number']
    ordering = ['-created_at']
    
    fieldsets = BaseUserAdmin.fieldsets + (
        ('Additional Info', {
            'fields': ('phone_number', 'user_type', 'profile_picture', 'date_of_birth',
                      'address', 'city', 'country', 'has_completed_onboarding')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'updated_at', 'last_active')
        }),
    )
    
    readonly_fields = ['created_at', 'updated_at', 'last_active']


@admin.register(SavedProperty)
class SavedPropertyAdmin(admin.ModelAdmin):
    list_display = ['user', 'property', 'saved_at']
    list_filter = ['saved_at']
    search_fields = ['user__email', 'property__location']
    date_hierarchy = 'saved_at'


@admin.register(PropertyView)
class PropertyViewAdmin(admin.ModelAdmin):
    list_display = ['property', 'user', 'viewed_at', 'ip_address']
    list_filter = ['viewed_at']
    search_fields = ['property__location', 'user__email', 'ip_address']
    date_hierarchy = 'viewed_at'
    readonly_fields = ['viewed_at']
