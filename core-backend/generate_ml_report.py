"""
ML Recommendation Model Test Report Generator
Outputs JSON results for specific test cases
"""
import os
import sys
import django
import json
from decimal import Decimal

# Setup Django
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'residea_backend.settings')
django.setup()

from apps.properties.models import Property
from apps.preferences.models import UserPreference
from apps.ml_services.ranker import PropertyRanker
from apps.ml_services.roi_predictor import ROIPredictor

# Helper function to convert Decimal to float for JSON
def decimal_to_float(obj):
    if isinstance(obj, Decimal):
        return float(obj)
    raise TypeError

print("="*100)
print("ML RECOMMENDATION MODEL - TEST REPORT")
print("="*100)

# Define test cases
test_cases = [
    {
        "name": "Test Case 1: F-6 Location, 9-80 Crore Budget, 4 Bedrooms",
        "preferences": {
            "city": "Islamabad",
            "min_budget": 90000000,  # 9 Crore
            "max_budget": 800000000,  # 80 Crore
            "bedrooms": 4,
            "bathrooms": 3,
            "preferred_locations": ["F-6"],
            "property_types": ["House", "Flat"]
        }
    },
    {
        "name": "Test Case 2: Bahria Town, 2-5 Crore Budget, 3 Bedrooms",
        "preferences": {
            "city": "Islamabad",
            "min_budget": 20000000,  # 2 Crore
            "max_budget": 50000000,  # 5 Crore
            "bedrooms": 3,
            "bathrooms": 2,
            "preferred_locations": ["Bahria Town"],
            "property_types": ["House"]
        }
    },
    {
        "name": "Test Case 3: DHA, 10-20 Crore Budget, 5 Bedrooms",
        "preferences": {
            "city": "Islamabad",
            "min_budget": 100000000,  # 10 Crore
            "max_budget": 200000000,  # 20 Crore
            "bedrooms": 5,
            "bathrooms": 4,
            "preferred_locations": ["DHA"],
            "property_types": ["House"]
        }
    }
]

# Initialize ML components
ranker = PropertyRanker()
roi_predictor = ROIPredictor()

# Results storage
all_results = {
    "test_date": "2025-12-11",
    "total_properties_in_db": Property.objects.count(),
    "ml_models_loaded": ranker.model_loader.is_loaded(),
    "test_cases": []
}

# Run each test case
for test_case in test_cases:
    print(f"\n{'='*100}")
    print(f"Running: {test_case['name']}")
    print(f"{'='*100}")
    
    prefs = test_case['preferences']
    print(f"\nInput Preferences:")
    print(f"  City: {prefs['city']}")
    print(f"  Budget: {prefs['min_budget']/10000000:.1f} - {prefs['max_budget']/10000000:.1f} Crore")
    print(f"  Bedrooms: {prefs['bedrooms']}")
    print(f"  Locations: {', '.join(prefs['preferred_locations'])}")
    print(f"  Property Types: {', '.join(prefs['property_types'])}")
    
    # Filter properties
    budget_buffer = 0.2
    min_price = prefs['min_budget'] * (1 - budget_buffer)
    max_price = prefs['max_budget'] * (1 + budget_buffer)
    
    from django.db.models import Q
    location_query = Q()
    for loc in prefs['preferred_locations']:
        location_query |= Q(location__icontains=loc)
    
    candidates = Property.objects.filter(
        price__gte=min_price,
        price__lte=max_price,
        bedrooms__gte=max(1, prefs['bedrooms'] - 1),
        bedrooms__lte=prefs['bedrooms'] + 1
    )
    
    if location_query:
        candidates = candidates.filter(location_query)
    
    print(f"\nFiltering Results:")
    print(f"  Total properties matching criteria: {candidates.count()}")
    
    # Create mock user preference object
    class MockPreference:
        def __init__(self, prefs_dict):
            self.city = prefs_dict['city']
            self.min_budget = Decimal(str(prefs_dict['min_budget']))
            self.max_budget = Decimal(str(prefs_dict['max_budget']))
            self.bedrooms = prefs_dict['bedrooms']
            self.bathrooms = prefs_dict['bathrooms']
            self.preferred_locations = prefs_dict['preferred_locations']
            self.property_types = prefs_dict['property_types']
            self.user_id = 'test'
    
    class MockUser:
        def __init__(self, prefs):
            self.id = 'test'
            self.property_preferences = type('obj', (object,), {
                'order_by': lambda x: type('obj', (object,), {'first': lambda: prefs})()
            })()
    
    mock_pref = MockPreference(prefs)
    mock_user = MockUser(mock_pref)
    
    # Get ML recommendations
    test_properties = list(candidates[:20])  # Test with top 20
    
    if len(test_properties) > 0:
        print(f"\nRunning ML Model on {len(test_properties)} properties...")
        
        try:
            ranked_properties = ranker.rank_properties(mock_user, test_properties)
            
            print(f"✓ ML Model returned {len(ranked_properties)} ranked properties")
            
            # Get top 5 recommendations
            top_5 = ranked_properties[:5]
            
            recommendations = []
            for i, (prop, ml_score) in enumerate(top_5, 1):
                # Get ROI estimate
                roi_data = roi_predictor.predict_roi(prop)
                
                rec = {
                    "rank": i,
                    "property_id": prop.id,
                    "title": prop.title,
                    "location": prop.location,
                    "price_pkr": float(prop.price),
                    "price_crore": float(prop.price) / 10000000,
                    "bedrooms": prop.bedrooms,
                    "bathrooms": prop.bathrooms,
                    "area_sqft": prop.area_sqft,
                    "property_type": prop.property_type,
                    "ml_score": round(float(ml_score), 2),
                    "match_percentage": int(min(ml_score * 10, 99)),
                    "roi_estimates": {
                        "roi_1yr": round(roi_data.get('roi_1yr', 0), 4),
                        "roi_5yr": round(roi_data.get('roi_5yr', 0), 4)
                    },
                    "amenity_scores": {
                        "hospital": prop.hospital_score,
                        "school": prop.school_score,
                        "metro": prop.metro_score,
                        "park": prop.park_score,
                        "average": prop.average_amenity_score
                    }
                }
                recommendations.append(rec)
                
                print(f"\n  Rank {i}:")
                print(f"    Property ID: {prop.id}")
                print(f"    Location: {prop.location}")
                print(f"    Price: {float(prop.price)/10000000:.2f} Crore")
                print(f"    Bedrooms: {prop.bedrooms} | Bathrooms: {prop.bathrooms}")
                print(f"    ML Score: {ml_score:.2f}")
                print(f"    Match: {int(min(ml_score * 10, 99))}%")
                print(f"    ROI (1yr/5yr): {roi_data.get('roi_1yr', 0):.2%} / {roi_data.get('roi_5yr', 0):.2%}")
            
            # Store results
            test_result = {
                "test_case_name": test_case['name'],
                "input_preferences": prefs,
                "filtering_stats": {
                    "total_in_db": Property.objects.count(),
                    "after_filters": candidates.count(),
                    "tested_properties": len(test_properties),
                    "recommendations_returned": len(recommendations)
                },
                "ml_recommendations": recommendations
            }
            all_results["test_cases"].append(test_result)
            
        except Exception as e:
            print(f"\n✗ ERROR: {str(e)}")
            import traceback
            traceback.print_exc()
            
            test_result = {
                "test_case_name": test_case['name'],
                "input_preferences": prefs,
                "error": str(e)
            }
            all_results["test_cases"].append(test_result)
    else:
        print(f"\n✗ No properties found matching criteria")
        test_result = {
            "test_case_name": test_case['name'],
            "input_preferences": prefs,
            "filtering_stats": {
                "total_in_db": Property.objects.count(),
                "after_filters": 0
            },
            "ml_recommendations": []
        }
        all_results["test_cases"].append(test_result)

# Save JSON report
output_file = "ml_recommendations_report.json"
with open(output_file, 'w') as f:
    json.dump(all_results, f, indent=2, default=decimal_to_float)

print(f"\n{'='*100}")
print(f"REPORT SUMMARY")
print(f"{'='*100}")
print(f"✓ Total test cases run: {len(test_cases)}")
print(f"✓ ML models loaded: {all_results['ml_models_loaded']}")
print(f"✓ JSON report saved to: {output_file}")
print(f"\nTo view full JSON report:")
print(f"  cat {output_file}")
print(f"{'='*100}")
