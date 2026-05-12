"""
Views for ML services
"""
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status

from apps.properties.models import Property
from .model_loader import MLModelLoader


class MLHealthCheckView(APIView):
    """
    GET /api/ml/health/
    Check if ML models are loaded and ready
    """
    permission_classes = []
    
    def get(self, request):
        loader = MLModelLoader()
        
        return Response({
            'models_loaded': loader.is_loaded(),
            'ranker_available': loader.ranker is not None,
            'roi_predictor_available': loader.roi_predictor is not None,
            'status': 'healthy' if loader.is_loaded() else 'degraded'
        })
