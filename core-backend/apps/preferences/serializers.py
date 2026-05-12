"""
Serializers for user preferences
"""
from rest_framework import serializers
from .models import UserPreference


class UserPreferenceSerializer(serializers.ModelSerializer):
    """Serializer for user preferences"""
    budget_range_formatted = serializers.ReadOnlyField()
    
    class Meta:
        model = UserPreference
        exclude = ['user']
        read_only_fields = ['created_at', 'updated_at']
    
    def validate(self, data):
        """Validate budget and bedroom ranges"""
        if data.get('min_budget') and data.get('max_budget'):
            if data['min_budget'] > data['max_budget']:
                raise serializers.ValidationError({
                    'max_budget': 'Maximum budget must be greater than minimum budget'
                })
        
        if data.get('min_bedrooms') and data.get('max_bedrooms'):
            if data['min_bedrooms'] > data['max_bedrooms']:
                raise serializers.ValidationError({
                    'max_bedrooms': 'Maximum bedrooms must be greater than minimum bedrooms'
                })
        
        return data
