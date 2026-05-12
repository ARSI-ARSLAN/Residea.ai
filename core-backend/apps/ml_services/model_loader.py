"""
ML Model Loader - Singleton pattern for loading XGBoost models
"""
import pickle
import os
import logging
from django.conf import settings

logger = logging.getLogger(__name__)


class MLModelLoader:
    """
    Singleton class for loading and caching ML models
    """
    _instance = None
    _ranker_model = None
    _roi_model = None
    _models_loaded = False
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def load_models(self):
        """Load both ML models from pickle files"""
        if self._models_loaded:
            logger.info("ML models already loaded")
            return
        
        try:
            # Load ranker model
            ranker_path = os.path.join(settings.ML_MODELS_DIR, 'xgbr_ranker (2).pkl')
            if os.path.exists(ranker_path):
                with open(ranker_path, 'rb') as f:
                    self._ranker_model = pickle.load(f)
                logger.info(f"Loaded ranker model from {ranker_path}")
            else:
                logger.warning(f"Ranker model not found at {ranker_path}")
            
            # Load ROI model
            roi_path = os.path.join(settings.ML_MODELS_DIR, 'xgbr_roi (2).pkl')
            if os.path.exists(roi_path):
                with open(roi_path, 'rb') as f:
                    self._roi_model = pickle.load(f)
                logger.info(f"Loaded ROI model from {roi_path}")
            else:
                logger.warning(f"ROI model not found at {roi_path}")
            
            self._models_loaded = True
            logger.info("ML models loaded successfully")
            
        except Exception as e:
            logger.error(f"Error loading ML models: {str(e)}")
            raise
    
    @property
    def ranker(self):
        """Get the ranker model"""
        if not self._models_loaded:
            self.load_models()
        return self._ranker_model
    
    @property
    def roi_predictor(self):
        """Get the ROI predictor model"""
        if not self._models_loaded:
            self.load_models()
        return self._roi_model
    
    def is_loaded(self):
        """Check if models are loaded"""
        return self._models_loaded and self._ranker_model is not None and self._roi_model is not None
