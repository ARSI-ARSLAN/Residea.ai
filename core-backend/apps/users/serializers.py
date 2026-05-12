"""
Serializers for User authentication and profile management
"""
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.password_validation import validate_password
from .models import User, SavedProperty


class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    password = serializers.CharField(
        write_only=True,
        required=True,
        validators=[validate_password],
        style={'input_type': 'password'}
    )
    password2 = serializers.CharField(
        write_only=True,
        required=True,
        style={'input_type': 'password'}
    )
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'username', 'password', 'password2',
            'first_name', 'last_name', 'phone_number', 'user_type'
        ]
        extra_kwargs = {
            'first_name': {'required': True},
            'last_name': {'required': True},
        }
    
    def validate(self, attrs):
        if attrs['password'] != attrs['password2']:
            raise serializers.ValidationError(
                {"password": "Password fields didn't match."}
            )
        return attrs
    
    def create(self, validated_data):
        validated_data.pop('password2')
        user = User.objects.create_user(**validated_data)
        return user


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """Custom JWT token serializer with additional user data"""
    
    # Override to accept 'email' instead of 'username'
    username_field = 'email'
    
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        
        # Add custom claims
        token['email'] = user.email
        token['user_type'] = user.user_type
        token['full_name'] = user.get_full_name()
        
        return token
    
    def validate(self, attrs):
        # Map 'email' to 'username' for parent class validation
        # since User model has USERNAME_FIELD = 'email'
        if 'email' in attrs:
            attrs[self.username_field] = attrs['email']
        
        data = super().validate(attrs)
        
        # Add extra responses
        data['user'] = {
            'id': self.user.id,
            'email': self.user.email,
            'username': self.user.username,
            'first_name': self.user.first_name,
            'last_name': self.user.last_name,
            'user_type': self.user.user_type,
            'has_completed_onboarding': self.user.has_completed_onboarding,
        }
        
        return data


class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for user profile"""
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    
    class Meta:
        model = User
        fields = [
            'id', 'email', 'username', 'first_name', 'last_name',
            'full_name', 'phone_number', 'user_type', 'profile_picture',
            'date_of_birth', 'address', 'city', 'country',
            'has_completed_onboarding', 'created_at', 'last_active'
        ]
        read_only_fields = ['id', 'email', 'created_at', 'last_active']


class UserUpdateSerializer(serializers.ModelSerializer):
    """Serializer for updating user profile"""
    
    class Meta:
        model = User
        fields = [
            'first_name', 'last_name', 'phone_number', 'user_type',
            'profile_picture', 'date_of_birth', 'address', 'city',
            'country', 'has_completed_onboarding'
        ]


class SavedPropertySerializer(serializers.ModelSerializer):
    """Serializer for saved properties"""
    property_details = serializers.SerializerMethodField()
    
    class Meta:
        model = SavedProperty
        fields = ['id', 'property', 'property_details', 'saved_at', 'notes']
        read_only_fields = ['id', 'saved_at']
    
    def get_property_details(self, obj):
        from apps.properties.serializers import PropertyListSerializer
        return PropertyListSerializer(obj.property).data
