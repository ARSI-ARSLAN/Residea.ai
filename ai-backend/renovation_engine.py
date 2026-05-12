from config import Config

class RenovationEngine:
    """Rule-based renovation intelligence engine"""
    
    def __init__(self):
        self.impact_weight = Config.IMPACT_WEIGHT
        self.feasibility_weight = Config.FEASIBILITY_WEIGHT
        self.budget_match_weight = Config.BUDGET_MATCH_WEIGHT
    
    def generate_suggestions(self, context):
        """
        Generate renovation suggestions based on context
        
        Args:
            context: Unified context from multimodal fusion
            
        Returns:
            List of renovation actions with priorities
        """
        room_type = context['room_type']
        
        # Route to room-specific logic
        if room_type == 'kitchen':
            suggestions = self._kitchen_suggestions(context)
        elif room_type == 'bedroom':
            suggestions = self._bedroom_suggestions(context)
        elif room_type == 'living_room':
            suggestions = self._living_room_suggestions(context)
        else:
            suggestions = []
        
        # Add dimension-based suggestions
        dims = context.get('room_dimensions', {})
        if dims.get('length') and dims.get('width'):
            area = dims['length'] * dims['width']
            height = dims.get('height', 0)
            
            if area < 120:
                suggestions.append({
                    'action': 'Space-saving design solutions',
                    'description': f'Room is compact ({dims["length"]}x{dims["width"]} ft). Use multi-functional furniture, wall-mounted storage, and mirrors to create an illusion of space.',
                    'impact': 8,
                    'feasibility': 8,
                    'budget_requirement': 'low',
                    'category': 'storage'
                })
            elif area > 300:
                suggestions.append({
                    'action': 'Zone the large space',
                    'description': f'Room is spacious ({dims["length"]}x{dims["width"]} ft). Create distinct functional zones using area rugs, furniture arrangement, and accent lighting.',
                    'impact': 7,
                    'feasibility': 9,
                    'budget_requirement': 'medium',
                    'category': 'decor'
                })
            
            if height and height >= 12:
                suggestions.append({
                    'action': 'Utilize vertical space',
                    'description': f'With {height} ft ceilings, add tall bookshelves, pendant lighting, or a statement chandelier.',
                    'impact': 7,
                    'feasibility': 7,
                    'budget_requirement': 'medium',
                    'category': 'decor'
                })
        
        # Add custom preference as a suggestion if provided
        custom_prefs = context.get('custom_preferences', '').strip()
        if custom_prefs:
            suggestions.append({
                'action': 'User-requested customization',
                'description': custom_prefs[:200],
                'impact': 9,
                'feasibility': 7,
                'budget_requirement': context.get('budget_tier', 'medium'),
                'category': 'decor'
            })
        
        # Score and prioritize suggestions
        scored_suggestions = self._score_suggestions(suggestions, context)
        
        # Sort by priority score
        scored_suggestions.sort(key=lambda x: x['priority_score'], reverse=True)
        
        return scored_suggestions
    
    def _kitchen_suggestions(self, context):
        """Generate kitchen-specific suggestions"""
        suggestions = []
        
        goal = context['renovation_goal']
        age = context['property_age']
        condition = context['current_condition']
        budget = context['budget_tier']
        objects = context['object_presence']
        
        # Cabinet suggestions
        if age > 10 or condition < 3:
            suggestions.append({
                'action': 'Replace or reface kitchen cabinets',
                'description': 'Update cabinets with modern finishes',
                'impact': 9,
                'feasibility': 7,
                'budget_requirement': 'medium',
                'category': 'cabinets'
            })
        
        # Lighting suggestions
        if context['lighting_score'] < 0.5:
            suggestions.append({
                'action': 'Install LED under-cabinet lighting',
                'description': 'Improve task lighting and ambiance',
                'impact': 7,
                'feasibility': 9,
                'budget_requirement': 'low',
                'category': 'lighting'
            })
        
        # Countertop suggestions
        if goal in ['modernize', 'luxury_upgrade']:
            suggestions.append({
                'action': 'Upgrade countertops',
                'description': 'Install quartz or granite countertops',
                'impact': 8,
                'feasibility': 6,
                'budget_requirement': 'high' if goal == 'luxury_upgrade' else 'medium',
                'category': 'surfaces'
            })
        
        # Backsplash
        if goal == 'modernize':
            suggestions.append({
                'action': 'Add modern backsplash',
                'description': 'Install subway tile or glass backsplash',
                'impact': 7,
                'feasibility': 8,
                'budget_requirement': 'low',
                'category': 'surfaces'
            })
        
        # Appliances
        if age > 15 and budget in ['medium', 'high']:
            suggestions.append({
                'action': 'Update appliances',
                'description': 'Replace with energy-efficient stainless steel appliances',
                'impact': 8,
                'feasibility': 7,
                'budget_requirement': 'high',
                'category': 'appliances'
            })
        
        # Paint
        suggestions.append({
            'action': 'Fresh paint',
            'description': 'Apply neutral, modern color palette',
            'impact': 6,
            'feasibility': 10,
            'budget_requirement': 'low',
            'category': 'paint'
        })
        
        return suggestions
    
    def _bedroom_suggestions(self, context):
        """Generate bedroom-specific suggestions"""
        suggestions = []
        
        goal = context['renovation_goal']
        condition = context['current_condition']
        budget = context['budget_tier']
        style = context['style_preference']
        
        # Lighting
        if context['lighting_score'] < 0.6:
            suggestions.append({
                'action': 'Improve bedroom lighting',
                'description': 'Add layered lighting with ambient, task, and accent lights',
                'impact': 7,
                'feasibility': 8,
                'budget_requirement': 'low',
                'category': 'lighting'
            })
        
        # Flooring
        if condition < 3:
            suggestions.append({
                'action': 'Update flooring',
                'description': 'Install hardwood or luxury vinyl plank flooring',
                'impact': 8,
                'feasibility': 6,
                'budget_requirement': 'medium',
                'category': 'flooring'
            })
        
        # Paint and accent wall
        suggestions.append({
            'action': 'Create accent wall',
            'description': f'Add {style} accent wall with paint or wallpaper',
            'impact': 6,
            'feasibility': 9,
            'budget_requirement': 'low',
            'category': 'paint'
        })
        
        # Built-in storage
        if goal in ['modernize', 'luxury_upgrade']:
            suggestions.append({
                'action': 'Add built-in storage',
                'description': 'Install custom closet system or built-in shelving',
                'impact': 7,
                'feasibility': 6,
                'budget_requirement': 'medium',
                'category': 'storage'
            })
        
        # Window treatments
        suggestions.append({
            'action': 'Update window treatments',
            'description': f'Install {style} curtains or blinds',
            'impact': 5,
            'feasibility': 10,
            'budget_requirement': 'low',
            'category': 'decor'
        })
        
        return suggestions
    
    def _living_room_suggestions(self, context):
        """Generate living room-specific suggestions"""
        suggestions = []
        
        goal = context['renovation_goal']
        condition = context['current_condition']
        budget = context['budget_tier']
        style = context['style_preference']
        
        # Lighting
        suggestions.append({
            'action': 'Upgrade lighting fixtures',
            'description': f'Install {style} ceiling fixture and floor lamps',
            'impact': 7,
            'feasibility': 8,
            'budget_requirement': 'low',
            'category': 'lighting'
        })
        
        # Flooring
        if condition < 4:
            suggestions.append({
                'action': 'Refinish or replace flooring',
                'description': 'Hardwood refinishing or new flooring installation',
                'impact': 8,
                'feasibility': 5,
                'budget_requirement': 'high',
                'category': 'flooring'
            })
        
        # Feature wall
        if goal == 'modernize':
            suggestions.append({
                'action': 'Create feature wall',
                'description': 'Add shiplap, stone veneer, or bold paint',
                'impact': 7,
                'feasibility': 7,
                'budget_requirement': 'medium',
                'category': 'walls'
            })
        
        # Built-ins
        if budget in ['medium', 'high']:
            suggestions.append({
                'action': 'Add built-in shelving',
                'description': 'Custom shelving around TV or fireplace',
                'impact': 6,
                'feasibility': 6,
                'budget_requirement': 'medium',
                'category': 'storage'
            })
        
        # Paint
        suggestions.append({
            'action': 'Fresh paint throughout',
            'description': f'Apply {style} color scheme',
            'impact': 6,
            'feasibility': 10,
            'budget_requirement': 'low',
            'category': 'paint'
        })
        
        return suggestions
    
    def _score_suggestions(self, suggestions, context):
        """Calculate priority scores for suggestions"""
        budget = context['budget_tier']
        
        for suggestion in suggestions:
            # Impact score (0-10)
            impact = suggestion['impact'] / 10.0
            
            # Feasibility score (0-10)
            feasibility = suggestion['feasibility'] / 10.0
            
            # Budget match score
            budget_req = suggestion['budget_requirement']
            budget_match = self._calculate_budget_match(budget, budget_req)
            
            # Calculate weighted priority score
            priority_score = (
                impact * self.impact_weight +
                feasibility * self.feasibility_weight +
                budget_match * self.budget_match_weight
            )
            
            suggestion['priority_score'] = round(priority_score, 2)
            suggestion['priority_level'] = self._get_priority_level(priority_score)
        
        return suggestions
    
    def _calculate_budget_match(self, user_budget, requirement):
        """Calculate how well suggestion matches user budget"""
        budget_values = {'low': 1, 'medium': 2, 'high': 3}
        user_val = budget_values.get(user_budget, 2)
        req_val = budget_values.get(requirement, 2)
        
        if req_val <= user_val:
            return 1.0  # Perfect match or under budget
        elif req_val == user_val + 1:
            return 0.5  # Slightly over budget
        else:
            return 0.2  # Well over budget
    
    def _get_priority_level(self, score):
        """Convert numeric score to priority level"""
        if score >= 0.7:
            return 'High'
        elif score >= 0.5:
            return 'Medium'
        else:
            return 'Low'
