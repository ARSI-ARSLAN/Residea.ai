"""
Serializers for admin API — full field access for admin CRUD operations.
"""
from rest_framework import serializers
from django.contrib.auth import get_user_model
from apps.properties.models import Property, PropertyImage, PropertyFeature
from apps.preferences.models import UserPreference

User = get_user_model()


# ─── Property Serializers ──────────────────────────────────────────────

class AdminPropertyImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyImage
        fields = ['id', 'image_url', 'caption', 'order', 'uploaded_at']


class AdminPropertyFeatureSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyFeature
        fields = ['id', 'name']


class AdminPropertyListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for admin property table view."""
    owner_email = serializers.SerializerMethodField()
    images_count = serializers.SerializerMethodField()
    features_count = serializers.SerializerMethodField()

    class Meta:
        model = Property
        fields = [
            'id', 'title', 'location', 'price', 'property_type',
            'bedrooms', 'bathrooms', 'area_sqft',
            'verified', 'is_active', 'is_featured',
            'views_count', 'main_image',
            'owner_email', 'images_count', 'features_count',
            'created_at', 'updated_at',
        ]

    def get_owner_email(self, obj):
        return obj.owner.email if obj.owner else None

    def get_images_count(self, obj):
        return obj.images.count()

    def get_features_count(self, obj):
        return obj.features.count()


class AdminPropertyDetailSerializer(serializers.ModelSerializer):
    """Full detail serializer for admin property view/edit."""
    images = AdminPropertyImageSerializer(many=True, read_only=True)
    features = AdminPropertyFeatureSerializer(many=True, read_only=True)
    owner_email = serializers.SerializerMethodField()
    price_per_sqft = serializers.ReadOnlyField()
    average_amenity_score = serializers.ReadOnlyField()

    class Meta:
        model = Property
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_owner_email(self, obj):
        return obj.owner.email if obj.owner else None


class AdminPropertyCreateUpdateSerializer(serializers.ModelSerializer):
    """Serializer for admin creating/updating properties — all fields writable."""

    # Make most fields optional for flexibility
    link = serializers.URLField(required=False, allow_blank=True)
    title = serializers.CharField(required=False, allow_blank=True, default='')
    description = serializers.CharField(required=False, allow_blank=True, default='')
    property_type = serializers.CharField(required=False, allow_blank=True, default='')
    main_image = serializers.URLField(required=False, allow_blank=True, default='')

    # Score fields — optional
    hospital_score = serializers.FloatField(required=False, default=0.0)
    school_score = serializers.FloatField(required=False, default=0.0)
    restaurant_score = serializers.FloatField(required=False, default=0.0)
    shopping_mall_score = serializers.FloatField(required=False, default=0.0)
    park_score = serializers.FloatField(required=False, default=0.0)
    metro_score = serializers.FloatField(required=False, default=0.0)
    security_score = serializers.FloatField(required=False, default=0.5)

    # Distance fields — optional
    dist_to_hospital = serializers.FloatField(required=False, allow_null=True, default=None)
    dist_to_school = serializers.FloatField(required=False, allow_null=True, default=None)
    dist_to_restaurant = serializers.FloatField(required=False, allow_null=True, default=None)
    dist_to_shopping_mall = serializers.FloatField(required=False, allow_null=True, default=None)
    dist_to_park = serializers.FloatField(required=False, allow_null=True, default=None)
    dist_to_metro = serializers.FloatField(required=False, allow_null=True, default=None)

    class Meta:
        model = Property
        fields = [
            'title', 'link', 'location', 'price', 'property_type', 'description',
            'bedrooms', 'bathrooms', 'area_sqft', 'main_image',
            'hospital_score', 'school_score', 'restaurant_score',
            'shopping_mall_score', 'park_score', 'metro_score', 'security_score',
            'dist_to_hospital', 'dist_to_school', 'dist_to_restaurant',
            'dist_to_shopping_mall', 'dist_to_park', 'dist_to_metro',
            'verified', 'is_active', 'is_featured',
            'approval_status', 'owner',
        ]

    def create(self, validated_data):
        import uuid
        if not validated_data.get('link'):
            validated_data['link'] = f'https://residea.ai/listing/{uuid.uuid4().hex}'
        return super().create(validated_data)


# ─── User Serializers ──────────────────────────────────────────────────

class AdminUserListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for admin user table view."""
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    properties_count = serializers.SerializerMethodField()
    saved_count = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'email', 'username', 'full_name',
            'first_name', 'last_name',
            'user_type', 'is_active', 'is_staff', 'is_superuser',
            'date_joined', 'last_active',
            'phone_number', 'city', 'country',
            'has_completed_onboarding',
            'properties_count', 'saved_count',
        ]

    def get_properties_count(self, obj):
        return obj.owned_properties.count()

    def get_saved_count(self, obj):
        return obj.saved_properties.count()


class AdminUserDetailSerializer(serializers.ModelSerializer):
    """Full detail serializer for admin user view."""
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    properties_count = serializers.SerializerMethodField()
    saved_count = serializers.SerializerMethodField()
    preferences = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = [
            'id', 'email', 'username', 'full_name',
            'first_name', 'last_name',
            'user_type', 'is_active', 'is_staff', 'is_superuser',
            'phone_number', 'profile_picture',
            'date_of_birth', 'address', 'city', 'country',
            'has_completed_onboarding',
            'date_joined', 'last_active', 'created_at', 'updated_at',
            'properties_count', 'saved_count', 'preferences',
        ]
        read_only_fields = ['id', 'email', 'date_joined', 'created_at', 'updated_at']

    def get_properties_count(self, obj):
        return obj.owned_properties.count()

    def get_saved_count(self, obj):
        return obj.saved_properties.count()

    def get_preferences(self, obj):
        try:
            pref = obj.preferences
            return {
                'city': pref.city,
                'min_budget': str(pref.min_budget),
                'max_budget': str(pref.max_budget),
                'bedrooms': pref.bedrooms,
                'bathrooms': pref.bathrooms,
                'property_types': pref.property_types,
                'purpose': pref.purpose,
                'preferred_locations': pref.preferred_locations,
            }
        except UserPreference.DoesNotExist:
            return None


class AdminUserUpdateSerializer(serializers.ModelSerializer):
    """Serializer for admin updating user accounts."""

    class Meta:
        model = User
        fields = [
            'first_name', 'last_name',
            'user_type', 'is_active', 'is_staff',
            'phone_number', 'city', 'country',
            'has_completed_onboarding',
        ]


# ─── Dashboard Serializers ─────────────────────────────────────────────

class AdminDashboardStatsSerializer(serializers.Serializer):
    """Serializer for admin dashboard statistics."""
    total_properties = serializers.IntegerField()
    active_properties = serializers.IntegerField()
    verified_properties = serializers.IntegerField()
    featured_properties = serializers.IntegerField()
    total_users = serializers.IntegerField()
    active_users = serializers.IntegerField()
    staff_users = serializers.IntegerField()
    new_users_30d = serializers.IntegerField()
    total_property_views = serializers.IntegerField()
    total_saved_properties = serializers.IntegerField()
    properties_by_type = serializers.DictField()
    recent_users = AdminUserListSerializer(many=True)
    recent_properties = AdminPropertyListSerializer(many=True)
