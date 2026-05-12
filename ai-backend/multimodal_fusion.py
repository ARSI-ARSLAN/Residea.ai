import numpy as np
from config import Config

class MultimodalFusion:
    """Combines image features, objects, metadata, and preferences into unified context"""
    
    def __init__(self):
        self.supported_rooms = Config.SUPPORTED_ROOMS
        self.renovation_goals = Config.RENOVATION_GOALS
        self.budget_tiers = Config.BUDGET_TIERS
        self.style_preferences = Config.STYLE_PREFERENCES
    
    def create_context_vector(self, vision_data, metadata, preferences):
        """
        Fuse all inputs into a structured context
        
        Args:
            vision_data: dict with features, objects, lighting
            metadata: dict with room_type, room_size, property_age, condition
            preferences: dict with goal, budget_tier, style
            
        Returns:
            Unified context dictionary
        """
        context = {
            # Vision analysis
            'image_features': vision_data.get('features', {}).get('features', []),
            'detected_objects': vision_data.get('objects', {}).get('objects', []),
            'lighting': vision_data.get('lighting', {}),
            
            # Room metadata
            'room_type': metadata.get('room_type', '').lower(),
            'room_size': self._normalize_room_size(metadata.get('room_size', 0)),
            'property_age': metadata.get('property_age', 0),
            'current_condition': self._normalize_condition(metadata.get('condition', 'fair')),
            'room_dimensions': metadata.get('room_dimensions', {}),
            
            # User preferences
            'renovation_goal': preferences.get('goal', '').lower(),
            'budget_tier': preferences.get('budget_tier', 'medium').lower(),
            'style_preference': preferences.get('style', 'modern').lower(),
            'custom_preferences': preferences.get('custom_preferences', ''),
            
            # Derived features
            'object_presence': self._create_object_presence_map(
                vision_data.get('objects', {}).get('objects', [])
            ),
            'lighting_score': self._calculate_lighting_score(vision_data.get('lighting', {})),
            'renovation_urgency': self._calculate_urgency(
                metadata.get('property_age', 0),
                metadata.get('condition', 'fair')
            )
        }
        
        # Validate context
        context['is_valid'] = self._validate_context(context)
        
        return context
    
    def _normalize_room_size(self, size):
        """Normalize room size to small/medium/large"""
        try:
            size_sqft = float(size)
            if size_sqft < 100:
                return 'small'
            elif size_sqft < 250:
                return 'medium'
            else:
                return 'large'
        except:
            return 'medium'
    
    def _normalize_condition(self, condition):
        """Normalize condition to numeric score"""
        condition_map = {
            'excellent': 5,
            'good': 4,
            'fair': 3,
            'poor': 2,
            'very_poor': 1
        }
        return condition_map.get(condition.lower(), 3)
    
    def _create_object_presence_map(self, detected_objects):
        """Create a map of detected object categories"""
        object_map = {
            'furniture': [],
            'appliances': [],
            'fixtures': [],
            'decor': []
        }
        
        furniture = {'bed', 'couch', 'chair', 'dining table'}
        appliances = {'refrigerator', 'oven', 'microwave', 'tv', 'laptop'}
        fixtures = {'sink', 'toilet'}
        decor = {'vase', 'potted plant', 'clock', 'book'}
        
        for obj in detected_objects:
            obj_name = obj['object'].lower()
            if obj_name in furniture:
                object_map['furniture'].append(obj)
            elif obj_name in appliances:
                object_map['appliances'].append(obj)
            elif obj_name in fixtures:
                object_map['fixtures'].append(obj)
            elif obj_name in decor:
                object_map['decor'].append(obj)
        
        return object_map
    
    def _calculate_lighting_score(self, lighting_data):
        """Calculate normalized lighting score (0-1)"""
        if not lighting_data:
            return 0.5
        
        mean_brightness = lighting_data.get('mean_brightness', 0.5)
        quality = lighting_data.get('quality', 'moderate')
        
        # Penalize extreme lighting
        if quality == 'dark':
            return mean_brightness * 0.7
        elif quality == 'bright':
            return 0.3 + mean_brightness * 0.7
        else:
            return mean_brightness
    
    def _calculate_urgency(self, property_age, condition):
        """Calculate renovation urgency score (0-1)"""
        # Age factor (0-1)
        age_factor = min(property_age / 30.0, 1.0)  # 30+ years = max urgency
        
        # Condition factor (0-1)
        condition_score = self._normalize_condition(condition) if isinstance(condition, str) else condition
        condition_factor = 1.0 - (condition_score / 5.0)
        
        # Combined urgency
        urgency = (age_factor * 0.6 + condition_factor * 0.4)
        return round(urgency, 2)
    
    def _validate_context(self, context):
        """Validate that context has required fields"""
        required_fields = ['room_type', 'renovation_goal', 'budget_tier']
        
        for field in required_fields:
            if not context.get(field):
                return False
        
        # Validate room type
        if context['room_type'] not in self.supported_rooms:
            return False
        
        return True
    
    def get_context_summary(self, context):
        """Generate human-readable context summary"""
        dims = context.get('room_dimensions', {})
        dims_str = ''
        if dims.get('length') and dims.get('width'):
            dims_str = f"{dims['length']}x{dims['width']}"
            if dims.get('height'):
                dims_str += f"x{dims['height']}"
            dims_str += ' ft'
        
        summary = {
            'room': context['room_type'].replace('_', ' ').title(),
            'size': context['room_size'].title(),
            'dimensions': dims_str or 'Not specified',
            'age': f"{context['property_age']} years",
            'condition': self._condition_from_score(context['current_condition']),
            'goal': context['renovation_goal'].replace('_', ' ').title(),
            'budget': context['budget_tier'].title(),
            'style': context['style_preference'].title(),
            'urgency': f"{int(context['renovation_urgency'] * 100)}%",
            'objects_detected': len(context['detected_objects'])
        }
        if context.get('custom_preferences'):
            summary['custom_preferences'] = context['custom_preferences'][:100]
        return summary
    
    def _condition_from_score(self, score):
        """Convert numeric condition back to label"""
        score_map = {5: 'Excellent', 4: 'Good', 3: 'Fair', 2: 'Poor', 1: 'Very Poor'}
        return score_map.get(score, 'Fair')
