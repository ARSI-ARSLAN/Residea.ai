"""
Views for user preferences
"""
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import UserPreference
from .serializers import UserPreferenceSerializer


class UserPreferenceView(generics.RetrieveUpdateAPIView):
    """
    GET/PUT /api/preferences/
    Get or update user preferences
    """
    serializer_class = UserPreferenceSerializer
    permission_classes = [IsAuthenticated]
    
    def get_object(self):
        """Get or create preferences for the current user"""
        obj, created = UserPreference.objects.get_or_create(user=self.request.user)
        return obj
