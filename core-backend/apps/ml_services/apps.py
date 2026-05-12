from django.apps import AppConfig


class MlServicesConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.ml_services'
    
    def ready(self):
        """Load ML models when Django starts"""
        from .model_loader import MLModelLoader
        loader = MLModelLoader()
        loader.load_models()
