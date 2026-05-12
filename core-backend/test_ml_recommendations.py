"""
Test script to verify ML model output
This will load the .pkl models and test them with user preferences
"""
import os
import sys
import django
import json

# Setup Django - add parent directory to path
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from apps.properties.models import Property
from apps.preferences.models import UserPreference
from apps.ml_services.model_loader import ModelLoader
import pandas as pd

def test_ml_recommendations():
    """Test ML model with actual user preferences"""
    
    # Load models
    model_loader = ModelLoader()
    ranker_model = model_loader.get_ranker_model()
    roi_model = model_loader.get_roi_model()
    
    print("=" * 80)
    print("ML MODEL TEST - Property Recommendations")
    print("=" * 80)
    
    # Test preferences (F-6, 9-80 crores)
    test_prefs = {
        'city': 'islamabad',
        'min_budget': 90000000,  # 9 crores
        'max_budget': 800000000,  # 80 crores
        'preferred_locations': ['F-6', 'f-6'],
        'bedrooms': 4,
        'bathrooms': 3,
        'property_types': ['house', 'flat']
    }
    
    print(f"\nTest User Preferences:")
    print(json.dumps(test_prefs, indent=2))
    
    # Get properties from database
    properties = Property.objects.filter(is_active=True)
    
    # Filter by budget
    budget_buffer = 0.2
    min_price = test_prefs['min_budget'] * (1 - budget_buffer)
    max_price = test_prefs['max_budget'] * (1 + budget_buffer)
    
    candidates = properties.filter(
        price__gte=min_price,
        price__lte=max_price
    )
    
    print(f"\nTotal active properties: {properties.count()}")
    print(f"After budget filter ({min_price/10000000:.1f}Cr - {max_price/10000000:.1f}Cr): {candidates.count()}")
    
    # Filter by location
    from django.db.models import Q
    location_query = Q()
    for loc in test_prefs['preferred_locations']:
        if loc:
            location_query |= Q(location__icontains=loc.strip())
    
    if location_query:
        location_matches = candidates.filter(location_query)
        print(f"After location filter (F-6): {location_matches.count()}")
    else:
        location_matches = candidates
    
    # Prepare data for ML model
    if location_matches.count() > 0:
        print(f"\n{'='*80}")
        print("PREPARING DATA FOR ML MODEL")
        print(f"{'='*80}\n")
        
        # Convert to DataFrame
        data = []
        for prop in location_matches[:50]:  # Limit to 50 for testing
            # Calculate features as per reference logic
            budget_center = (test_prefs['min_budget'] + test_prefs['max_budget']) / 2
            budget_range = test_prefs['max_budget'] - test_prefs['min_budget']
            
            # Price fit score
            if budget_range > 0:
                price_fit_score = 1 - abs(float(prop.price) - budget_center) / (budget_range / 2)
                price_fit_score = max(0, min(1, price_fit_score))
            else:
                price_fit_score = 0.5
            
            # Bedroom match
            bedroom_match = 1 if prop.bedrooms >= test_prefs['bedrooms'] else 0
            
            # Location match
            location_exact_match = 1 if any(loc.lower() in prop.location.lower() for loc in test_prefs['preferred_locations']) else 0
            
            # Facility scores (already in database)
            school_score = prop.school_score / 100.0
            hospital_score = prop.hospital_score / 100.0
            metro_score = prop.metro_score / 100.0
            park_score = prop.park_score / 100.0
            
            # Facility match ratio (simplified)
            facility_match_ratio = (school_score + hospital_score + metro_score + park_score) / 4
            
            # Risk-adjusted values (simplified)
            risk_adjusted_safety = 1.0  # Default
            risk_adjusted_roi = 1.0  # Default
            
            data.append({
                'property_id': prop.id,
                'title': prop.title,
                'location': prop.location,
                'price': float(prop.price),
                'bedrooms': prop.bedrooms,
                'price_fit_score': price_fit_score,
                'bedroom_match': bedroom_match,
                'area_match_score': 0.0,  # Not using area matching
                'location_match_score': float(location_exact_match),
                'school_score': school_score,
                'hospital_score': hospital_score,
                'metro_score': metro_score,
                'park_score': park_score,
                'facility_match_ratio': facility_match_ratio,
                'risk_adjusted_safety': risk_adjusted_safety,
                'risk_adjusted_roi': risk_adjusted_roi
            })
        
        df = pd.DataFrame(data)
        
        print(f"Prepared {len(df)} properties for ML ranking")
        print(f"\nSample features:")
        print(df[['title', 'price_fit_score', 'bedroom_match', 'location_match_score']].head())
        
        # Prepare features for ML models
        rank_features = [
            'price_fit_score', 'bedroom_match', 'area_match_score', 'location_match_score',
            'school_score', 'hospital_score', 'metro_score', 'park_score',
            'facility_match_ratio', 'risk_adjusted_safety', 'risk_adjusted_roi'
        ]
        
        roi_features = [
            'price_fit_score', 'bedroom_match', 'area_match_score', 'location_match_score',
            'school_score', 'hospital_score', 'metro_score', 'park_score',
            'facility_match_ratio', 'risk_adjusted_safety'
        ]
        
        X_rank = df[rank_features]
        X_roi = df[roi_features]
        
        # Predict using ML models
        print(f"\n{'='*80}")
        print("ML MODEL PREDICTIONS")
        print(f"{'='*80}\n")
        
        df['rank_score'] = ranker_model.predict(X_rank)
        df['roi_predicted'] = roi_model.predict(X_roi)
        
        # Normalize rank score to 0-10
        min_score = df['rank_score'].min()
        max_score = df['rank_score'].max()
        if max_score - min_score > 0:
            df['rank_score_normalized'] = 10 * (df['rank_score'] - min_score) / (max_score - min_score)
        else:
            df['rank_score_normalized'] = 5.0
        
        # Convert ROI to percentage
        df['roi_percent'] = (df['roi_predicted'] * 100).round(1)
        
        # Sort by rank score
        df_sorted = df.sort_values('rank_score_normalized', ascending=False)
        
        print("TOP 10 RECOMMENDATIONS:")
        print(f"\n{'-'*120}")
        print(f"{'Rank':<6} {'Title':<40} {'Location':<25} {'Price (Cr)':<12} {'Score':<8} {'ROI %':<8}")
        print(f"{'-'*120}")
        
        for idx, row in df_sorted.head(10).iterrows():
            print(f"{idx+1:<6} {row['title'][:38]:<40} {row['location'][:23]:<25} "
                  f"{row['price']/10000000:>10.1f} {row['rank_score_normalized']:>7.2f} {row['roi_percent']:>7.1f}")
        
        print(f"{'-'*120}\n")
        
        # Output as JSON for frontend
        recommendations_json = []
        for idx, row in df_sorted.head(10).iterrows():
            recommendations_json.append({
                'property_id': int(row['property_id']),
                'title': row['title'],
                'location': row['location'],
                'price': float(row['price']),
                'bedrooms': int(row['bedrooms']),
                'rank_score': float(row['rank_score_normalized']),
                'roi_percent': float(row['roi_percent']),
                'match_percentage': int(min(row['rank_score_normalized'] * 10, 99))
            })
        
        print(f"\n{'='*80}")
        print("JSON OUTPUT FOR FRONTEND")
        print(f"{'='*80}\n")
        print(json.dumps(recommendations_json, indent=2))
        
        return recommendations_json
    else:
        print("\nNo properties found matching the criteria!")
        return []

if __name__ == '__main__':
    test_ml_recommendations()
