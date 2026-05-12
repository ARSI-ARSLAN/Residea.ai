"""
Property Ranker using XGBoost ML model
"""
import logging
import numpy as np
from .model_loader import MLModelLoader
from .feature_engineering import FeatureEngineer

logger = logging.getLogger(__name__)


class PropertyRanker:
    """
    Service for ranking properties using ML model
    """
    
    def __init__(self):
        self.model_loader = MLModelLoader()
        self.feature_engineer = FeatureEngineer()
    
    def rank_properties(self, user, properties_queryset):
        """
        Rank properties for a user based on their preferences
        
        Args:
            user: User model instance
            properties_queryset: QuerySet or list of Property objects
        
        Returns:
            List of (property, score) tuples sorted by score descending
        """
        try:
            # Get latest preferences - handle both direct user object and mock user
            if hasattr(user, 'preferences'):
                # Direct relationship via OneToOne
                user_prefs = user.preferences
            elif hasattr(user, 'property_preferences'):
                # Mock user with property_preferences attribute
                user_prefs = user.property_preferences.order_by('-created_at').first()
            else:
                user_prefs = None
                
            if not user_prefs:
                raise AttributeError("No preferences found")
                
        except Exception as e:
            logger.warning(f"User {user.id if hasattr(user, 'id') else 'unknown'} has no preferences: {str(e)}")
            # Return properties with default score
            return [(prop, 0.5) for prop in properties_queryset]
        
        if not self.model_loader.is_loaded():
            logger.warning("ML models not loaded, using fallback ranking")
            return self._fallback_ranking(properties_queryset, user_prefs)
        
        results = []
        
        for property_obj in properties_queryset:
            try:
                # Prepare features using exact same logic as training
                features = self.feature_engineer.prepare_ranking_features(
                    property_obj, user_prefs
                )
                
                # Predict score using XGBoost ranker
                score = self.model_loader.ranker.predict(features)[0]
                results.append((property_obj, float(score)))
                
            except Exception as e:
                logger.error(f"Error ranking property {property_obj.id}: {str(e)}")
                # Use fallback score
                results.append((property_obj, 0.5))
        
        # Sort by score descending
        results.sort(key=lambda x: x[1], reverse=True)
        
        # Normalize scores to 0-10 range (matching training script)
        if results:
            scores = [score for _, score in results]
            min_score = min(scores)
            max_score = max(scores)
            
            if max_score - min_score > 0:
                normalized_results = []
                for prop, score in results:
                    normalized_score = 10 * (score - min_score) / (max_score - min_score)
                    normalized_results.append((prop, normalized_score))
                return normalized_results
        
        return results
    
    def _fallback_ranking(self, properties_queryset, user_prefs):
        """
        Fallback ranking when ML model is not available
        Uses simple rule-based scoring matching the training logic
        """
        results = []
        
        budget_center = (user_prefs.min_budget + user_prefs.max_budget) / 2
        budget_range = user_prefs.max_budget - user_prefs.min_budget
        
        for prop in properties_queryset:
            score = 0.0
            
            # Price fit (30% weight)
            price_fit = self.feature_engineer.price_fit_score(
                float(prop.price), budget_center, budget_range
            )
            score += price_fit * 0.3
            
            # Bedroom match (20% weight)
            # Use strict matching based on exact bedrooms or range
            if prop.bedrooms == user_prefs.bedrooms:
                score += 0.2
            elif abs(prop.bedrooms - user_prefs.bedrooms) <= 1:
                score += 0.1
            
            # Location match (20% weight)
            if user_prefs.preferred_locations:
                property_location = prop.location.lower() if prop.location else ""
                for pref_loc in user_prefs.preferred_locations:
                    if pref_loc and pref_loc.lower() in property_location:
                        score += 0.2
                        break
            
            # Amenity score (30% weight) - scores are already 0-1
            score += prop.average_amenity_score * 0.3
            
            results.append((prop, score))
        
        results.sort(key=lambda x: x[1], reverse=True)
        
        # Normalize to 0-10
        if results:
            scores = [score for _, score in results]
            min_score = min(scores)
            max_score = max(scores)
            
            if max_score - min_score > 0:
                normalized_results = []
                for prop, score in results:
                    normalized_score = 10 * (score - min_score) / (max_score - min_score)
                    normalized_results.append((prop, normalized_score))
                return normalized_results
        
        return results
