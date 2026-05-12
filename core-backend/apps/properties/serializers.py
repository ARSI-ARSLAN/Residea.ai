"""
Serializers for Property API
"""
from rest_framework import serializers
from .models import Property, PropertyImage, PropertyFeature


class PropertyImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyImage
        fields = ['id', 'image_url', 'caption', 'order']


class PropertyFeatureSerializer(serializers.ModelSerializer):
    class Meta:
        model = PropertyFeature
        fields = ['id', 'name']


class PropertyListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for property lists"""
    price_per_sqft = serializers.ReadOnlyField()
    average_amenity_score = serializers.ReadOnlyField()
    features = PropertyFeatureSerializer(many=True, read_only=True)
    
    class Meta:
        model = Property
        fields = [
            'id', 'title', 'location', 'price', 'price_per_sqft',
            'bedrooms', 'bathrooms', 'area_sqft', 'property_type',
            'verified', 'main_image', 'views_count',
            # Amenity Scores (0-1 normalized)
            'hospital_score', 'school_score', 'restaurant_score',
            'shopping_mall_score', 'park_score', 'metro_score',
            'average_amenity_score', 'security_score',
            # Distances (in km)
            'dist_to_hospital', 'dist_to_school', 'dist_to_restaurant',
            'dist_to_shopping_mall', 'dist_to_park', 'dist_to_metro',
            # Features/Amenities
            'features',
            # Society Approvals
            'approval_status',
            'created_at', 'link', 'description'
        ]


class PropertyDetailSerializer(serializers.ModelSerializer):
    """Detailed serializer for single property view"""
    images = PropertyImageSerializer(many=True, read_only=True)
    features = PropertyFeatureSerializer(many=True, read_only=True)
    price_per_sqft = serializers.ReadOnlyField()
    average_amenity_score = serializers.ReadOnlyField()
    
    class Meta:
        model = Property
        fields = '__all__'
        read_only_fields = ['id', 'created_at', 'updated_at', 'views_count']


class PropertyCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating properties"""

    # Make score fields optional (frontend doesn't provide these)
    hospital_score = serializers.FloatField(required=False, default=0.0)
    school_score = serializers.FloatField(required=False, default=0.0)
    restaurant_score = serializers.FloatField(required=False, default=0.0)
    shopping_mall_score = serializers.FloatField(required=False, default=0.0)
    park_score = serializers.FloatField(required=False, default=0.0)
    metro_score = serializers.FloatField(required=False, default=0.0)
    security_score = serializers.FloatField(required=False, default=0.5)

    # Make link optional — auto-generated if not provided
    link = serializers.URLField(required=False, allow_blank=True)

    # Make other optional fields explicit
    description = serializers.CharField(required=False, allow_blank=True, default='')
    title = serializers.CharField(required=False, allow_blank=True, default='')
    property_type = serializers.CharField(required=False, allow_blank=True, default='')
    main_image = serializers.URLField(required=False, allow_blank=True, default='')
    verified = serializers.BooleanField(required=False, default=False)
    is_active = serializers.BooleanField(required=False, default=True)
    is_featured = serializers.BooleanField(required=False, default=False)

    # Distance fields — optional
    dist_to_hospital = serializers.FloatField(required=False, allow_null=True, default=None)
    dist_to_school = serializers.FloatField(required=False, allow_null=True, default=None)
    dist_to_restaurant = serializers.FloatField(required=False, allow_null=True, default=None)
    dist_to_shopping_mall = serializers.FloatField(required=False, allow_null=True, default=None)
    dist_to_park = serializers.FloatField(required=False, allow_null=True, default=None)
    dist_to_metro = serializers.FloatField(required=False, allow_null=True, default=None)

    class Meta:
        model = Property
        exclude = ['owner', 'views_count', 'created_at', 'updated_at']

    def create(self, validated_data):
        import uuid
        # Set owner from request user
        validated_data['owner'] = self.context['request'].user
        # Auto-generate unique link if not provided or blank
        if not validated_data.get('link'):
            validated_data['link'] = f'https://residea.ai/listing/{uuid.uuid4().hex}'
        return super().create(validated_data)


class PropertyRecommendationSerializer(serializers.Serializer):
    """Serializer for property recommendations with ML scores"""
    property = PropertyListSerializer()
    score = serializers.FloatField()
    match_percentage = serializers.IntegerField()
    roi_1yr = serializers.FloatField(required=False)
    roi_5yr = serializers.FloatField(required=False)
    
    def validate(self, data):
        """Validate that min_budget <= max_budget"""
        if 'min_budget' in data and 'max_budget' in data:
            if data['min_budget'] > data['max_budget']:
                raise serializers.ValidationError({
                    'min_budget': 'Minimum budget cannot exceed maximum budget'
                })
        return data
