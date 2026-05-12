"""
Feature Engineering for ML Models
IMPORTANT: This must match the exact features used during model training
"""
import numpy as np
import math
from typing import Dict, Any


class FeatureEngineer:
    """
    Prepares features for ML models matching the training data format
    """
    
    @staticmethod
    def price_fit_score(clean_price: float, budget_center: float, budget_range: float) -> float:
        """
        Calculate how well a property's price fits the user's budget
        Returns a score between 0 and 1
        """
        if budget_range <= 0 or math.isnan(clean_price) or math.isnan(budget_center):
            return 0.0
        score = 1 - abs(clean_price - budget_center) / (budget_range / 2)
        return float(np.clip(score, 0, 1))
    
    def prepare_ranking_features(self, property_obj, user_prefs) -> np.ndarray:
        """
        Prepare features for the ranking model
        
        Features (in exact order):
        1. price_fit_score
        2. bedroom_match
        3. area_match_score
        4. location_match_score
        5. school_score
        6. hospital_score
        7. metro_score
        8. park_score
        9. facility_match_ratio
        10. risk_adjusted_safety
        11. risk_adjusted_roi
        """
        # Budget calculations - convert Decimal to float
        budget_center = float((user_prefs.min_budget + user_prefs.max_budget) / 2)
        budget_range = float(user_prefs.max_budget - user_prefs.min_budget)
        
        # 1. Price fit score
        price_fit = self.price_fit_score(
            float(property_obj.price),
            budget_center,
            budget_range
        )
        
        # 2. Bedroom match (1 if meets requirement, 0 otherwise)
        bedroom_match = 1.0 if property_obj.bedrooms >= user_prefs.min_bedrooms else 0.0
        
        # 3. Area match score (not provided by user, default to 0)
        area_match = 0.0
        
        # 4. Location match score
        property_location = property_obj.location.lower() if property_obj.location else ""
        preferred_locations = [loc.lower() for loc in user_prefs.preferred_locations] if user_prefs.preferred_locations else []
        
        location_match = 0.0
        if preferred_locations:
            for pref_loc in preferred_locations:
                if pref_loc in property_location:
                    location_match = 1.0
                    break
        
        # 5-8. Facility scores (already normalized to 0-1 in database)
        school_score = float(property_obj.school_score) if property_obj.school_score else 0.0
        hospital_score = float(property_obj.hospital_score) if property_obj.hospital_score else 0.0
        metro_score = float(property_obj.metro_score) if property_obj.metro_score else 0.0
        park_score = float(property_obj.park_score) if property_obj.park_score else 0.0
        
        # 9. Facility match ratio
        # Check which facilities user wants and how many the property has
        facility_scores = {
            'school': school_score,
            'hospital': hospital_score,
            'metro': metro_score,
            'park': park_score,
            'shopping_mall': float(property_obj.shopping_mall_score) if property_obj.shopping_mall_score else 0.0,
            'restaurant': float(property_obj.restaurant_score) if property_obj.restaurant_score else 0.0,
        }
        
        # Count how many requested facilities are available (score > 0)
        requested_facilities = []
        # Use getattr to stay aligned with the actual UserPreference fields
        if getattr(user_prefs, 'school_importance', 0) > 0:
            requested_facilities.append('school')
        if getattr(user_prefs, 'hospital_importance', 0) > 0:
            requested_facilities.append('hospital')
        if getattr(user_prefs, 'metro_importance', 0) > 0:
            requested_facilities.append('metro')
        if getattr(user_prefs, 'park_importance', 0) > 0:
            requested_facilities.append('park')
        # Map shopping/restaurant importance to the available preference fields
        if getattr(user_prefs, 'shopping_importance', 0) > 0:
            requested_facilities.append('shopping_mall')
        if getattr(user_prefs, 'restaurant_importance', 0) > 0:
            requested_facilities.append('restaurant')
        
        facility_match_count = sum(1 for f in requested_facilities if facility_scores.get(f, 0) > 0)
        facility_match_ratio = facility_match_count / max(len(requested_facilities), 1)
        
        # 10. Risk-adjusted safety (default to 1.0 if not available)
        risk_adjusted_safety = 1.0
        
        # 11. Risk-adjusted ROI (simple estimate based on price)
        # Use property price relative to median as a proxy
        risk_adjusted_roi = 1.0  # Default value
        
        # Combine all features in exact order
        features = np.array([[
            price_fit,
            bedroom_match,
            area_match,
            location_match,
            school_score,
            hospital_score,
            metro_score,
            park_score,
            facility_match_ratio,
            risk_adjusted_safety,
            risk_adjusted_roi
        ]])
        
        return features
    
    def prepare_roi_features(self, property_obj, user_prefs) -> np.ndarray:
        """
        Prepare features for the ROI prediction model
        
        Features (in exact order):
        1. price_fit_score
        2. bedroom_match
        3. area_match_score
        4. location_match_score
        5. school_score
        6. hospital_score
        7. metro_score
        8. park_score
        9. facility_match_ratio
        10. risk_adjusted_safety
        """
        # Get ranking features (first 11)
        rank_features = self.prepare_ranking_features(property_obj, user_prefs)
        
        # ROI features are the first 10 features (excluding risk_adjusted_roi)
        roi_features = rank_features[:, :10]
        
        return roi_features
