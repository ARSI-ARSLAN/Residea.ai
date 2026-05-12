"""
ROI Predictor using XGBoost ML model
"""
import logging
import numpy as np
from .model_loader import MLModelLoader
from .feature_engineering import FeatureEngineer

logger = logging.getLogger(__name__)


class ROIPredictor:
    """
    Service for predicting ROI using ML model
    """
    
    def __init__(self):
        self.model_loader = MLModelLoader()
        self.feature_engineer = FeatureEngineer()
    
    def predict_roi(self, property_obj, user_prefs=None):
        """
        Predict ROI for a property
        
        Args:
            property_obj: Property model instance
            user_prefs: UserPreference model instance (optional)
        
        Returns:
            Dictionary with ROI predictions
        """
        if not self.model_loader.is_loaded():
            logger.warning("ML models not loaded, using fallback ROI")
            return self._fallback_roi(property_obj)
        
        try:
            # If no user preferences provided, use default/fallback
            if user_prefs is None:
                return self._fallback_roi(property_obj)
            
            # Prepare features
            features = self.feature_engineer.prepare_roi_features(property_obj, user_prefs)
            
            # Predict ROI
            # Use cached ROI predictor model
            roi_predicted = self.model_loader.roi_predictor.predict(features)[0]
            
            # Convert to percentage and calculate different timeframes
            # The model predicts a multiplier, convert to percentage
            roi_percent = float(roi_predicted * 100)
            
            return {
                'roi_1yr': round(roi_percent / 5, 2),  # 1-year estimate
                'roi_3yr': round(roi_percent / 2, 2),  # 3-year estimate
                'roi_5yr': round(roi_percent, 2),      # 5-year estimate (main prediction)
                'roi_predicted': round(roi_percent, 2),
                'risk_adjusted_roi': round(roi_predicted, 4),
                'base_score': round(float(property_obj.average_amenity_score), 2)
            }
            
        except Exception as e:
            logger.error(f"Error predicting ROI for property {property_obj.id}: {str(e)}")
            return self._fallback_roi(property_obj)
    
    def _fallback_roi(self, property_obj):
        """
        Fallback ROI calculation when ML model is not available
        Based on property amenity scores
        """
        # Simple ROI estimate based on amenity scores
        base_roi = float(property_obj.average_amenity_score) / 10.0  # Convert 0-100 to 0-10
        
        return {
            'roi_1yr': round(base_roi * 0.5, 2),
            'roi_3yr': round(base_roi * 1.5, 2),
            'roi_5yr': round(base_roi * 2.5, 2),
            'roi_predicted': round(base_roi * 2.5, 2),
            'risk_adjusted_roi': round(base_roi / 10.0, 4),
            'base_score': round(float(property_obj.average_amenity_score), 2)
        }
