"""
Filters for admin API — enabling search, filter, and ordering on admin views.
"""
import django_filters
from apps.properties.models import Property
from django.contrib.auth import get_user_model

User = get_user_model()


class AdminPropertyFilter(django_filters.FilterSet):
    """Admin filter for properties — supports range filters and text search."""

    # Price range
    min_price = django_filters.NumberFilter(field_name='price', lookup_expr='gte')
    max_price = django_filters.NumberFilter(field_name='price', lookup_expr='lte')

    # Date range
    created_after = django_filters.DateFilter(field_name='created_at', lookup_expr='gte')
    created_before = django_filters.DateFilter(field_name='created_at', lookup_expr='lte')

    # Bedrooms range
    min_bedrooms = django_filters.NumberFilter(field_name='bedrooms', lookup_expr='gte')
    max_bedrooms = django_filters.NumberFilter(field_name='bedrooms', lookup_expr='lte')

    # Area range
    min_area = django_filters.NumberFilter(field_name='area_sqft', lookup_expr='gte')
    max_area = django_filters.NumberFilter(field_name='area_sqft', lookup_expr='lte')

    # Text search
    location = django_filters.CharFilter(field_name='location', lookup_expr='icontains')
    title = django_filters.CharFilter(field_name='title', lookup_expr='icontains')

    # Boolean filters
    verified = django_filters.BooleanFilter()
    is_active = django_filters.BooleanFilter()
    is_featured = django_filters.BooleanFilter()

    # Property type
    property_type = django_filters.CharFilter(field_name='property_type', lookup_expr='iexact')

    # Owner
    owner = django_filters.NumberFilter(field_name='owner__id')

    class Meta:
        model = Property
        fields = [
            'verified', 'is_active', 'is_featured', 'property_type',
            'min_price', 'max_price', 'min_bedrooms', 'max_bedrooms',
            'min_area', 'max_area', 'location', 'title', 'owner',
            'created_after', 'created_before',
        ]


class AdminUserFilter(django_filters.FilterSet):
    """Admin filter for users — supports role, status, and date filters."""

    # Text search
    email = django_filters.CharFilter(field_name='email', lookup_expr='icontains')
    name = django_filters.CharFilter(method='filter_by_name')

    # Role filter
    user_type = django_filters.CharFilter(field_name='user_type', lookup_expr='iexact')

    # Status filters
    is_active = django_filters.BooleanFilter()
    is_staff = django_filters.BooleanFilter()

    # Date range
    joined_after = django_filters.DateFilter(field_name='date_joined', lookup_expr='gte')
    joined_before = django_filters.DateFilter(field_name='date_joined', lookup_expr='lte')

    # City
    city = django_filters.CharFilter(field_name='city', lookup_expr='icontains')

    class Meta:
        model = User
        fields = [
            'email', 'user_type', 'is_active', 'is_staff',
            'joined_after', 'joined_before', 'city',
        ]

    def filter_by_name(self, queryset, name, value):
        """Search across first_name and last_name."""
        from django.db.models import Q
        return queryset.filter(
            Q(first_name__icontains=value) | Q(last_name__icontains=value)
        )
