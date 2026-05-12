"""
Django filters for Property model
"""
from django_filters import rest_framework as filters
from .models import Property


class PropertyFilter(filters.FilterSet):
    """
    Filter set for Property model
    """
    min_price = filters.NumberFilter(field_name='price', lookup_expr='gte')
    max_price = filters.NumberFilter(field_name='price', lookup_expr='lte')
    min_bedrooms = filters.NumberFilter(field_name='bedrooms', lookup_expr='gte')
    max_bedrooms = filters.NumberFilter(field_name='bedrooms', lookup_expr='lte')
    min_bathrooms = filters.NumberFilter(field_name='bathrooms', lookup_expr='gte')
    min_area = filters.NumberFilter(field_name='area_sqft', lookup_expr='gte')
    max_area = filters.NumberFilter(field_name='area_sqft', lookup_expr='lte')
    location = filters.CharFilter(field_name='location', lookup_expr='icontains')
    property_type = filters.CharFilter(field_name='property_type', lookup_expr='iexact')
    verified_only = filters.BooleanFilter(field_name='verified')
    
    class Meta:
        model = Property
        fields = [
            'min_price', 'max_price', 'min_bedrooms', 'max_bedrooms',
            'min_bathrooms', 'min_area', 'max_area', 'location',
            'property_type', 'verified_only'
        ]
