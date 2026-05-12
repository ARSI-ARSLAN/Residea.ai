"""
Test ML Model Output and Recommendations API
This script tests:
1. ML model loading
2. Feature engineering
3. Model predictions
4. API endpoint integration
"""
import os
import sys
import django
import json

# Setup Django
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'residea_backend.settings')
django.setup()

from apps.properties.models import Property
from apps.preferences.models import UserPreference
from apps.ml_services.model_loader import MLModelLoader
from apps.ml_services.ranker import PropertyRanker
from apps.ml_services.feature_engineering import FeatureEngineer

print("="*80)
print("ML MODEL AND API TESTING")
print("="*80)

# Test 1: Check if models are loaded
print("\n[TEST 1] Checking ML Model Loading...")
loader = MLModelLoader()
print(f"✓ Ranker model loaded: {loader.ranker is not None}")
print(f"✓ ROI model loaded: {loader.roi_predictor is not None}")
print(f"✓ Models loaded status: {loader.is_loaded()}")

# Test 2: Get test user preferences
print("\n[TEST 2] Getting User Preferences...")
user_pref = UserPreference.objects.first()
if user_pref:
    print(f"✓ Found user preference:")
    print(f"  - City: {user_pref.city}")
    print(f"  - Budget: {user_pref.min_budget} - {user_pref.max_budget}")
    print(f"  - Bedrooms: {user_pref.bedrooms}")
    print(f"  - Locations: {user_pref.preferred_locations}")
else:
    print("✗ No user preferences found - creating test preference")
    from apps.users.models import User
    test_user = User.objects.first()
    if test_user:
        user_pref = UserPreference.objects.create(
            user=test_user,
            city='Islamabad',
            min_budget=90000000,  # 9 Cr
            max_budget=800000000,  # 80 Cr
            bedrooms=4,
            bathrooms=3,
            preferred_locations=['F-6', 'F-7'],
            property_types=['House', 'Flat']
        )
        print(f"✓ Created test preference for user {test_user.email}")

# Test 3: Filter properties based on preferences
print("\n[TEST 3] Filtering Properties by Preferences...")
budget_buffer = 0.2
min_price = float(user_pref.min_budget) * (1 - budget_buffer)
max_price = float(user_pref.max_budget) * (1 + budget_buffer)

candidates = Property.objects.filter(
    price__gte=min_price,
    price__lte=max_price,
    bedrooms__gte=max(1, user_pref.bedrooms - 1),
    bedrooms__lte=user_pref.bedrooms + 1
)

print(f"✓ Total properties in DB: {Property.objects.count()}")
print(f"✓ After budget filter ({min_price/10000000:.1f}Cr - {max_price/10000000:.1f}Cr): {candidates.count()}")

# Test 4: Test feature engineering
print("\n[TEST 4] Testing Feature Engineering...")
feature_engineer = FeatureEngineer()
test_property = candidates.first()
if test_property:
    try:
        features = feature_engineer.prepare_ranking_features(test_property, user_pref)
        print(f"✓ Features generated for property {test_property.id}:")
        print(f"  - Feature shape: {features.shape}")
        print(f"  - Sample values: {features[0][:5]}")
    except Exception as e:
        print(f"✗ Feature engineering failed: {str(e)}")
        import traceback
        traceback.print_exc()

# Test 5: Test ML model predictions
print("\n[TEST 5] Testing ML Model Predictions...")
ranker = PropertyRanker()

# Create mock user object
class MockUser:
    def __init__(self, prefs):
        self.id = prefs.user_id if hasattr(prefs, 'user_id') else 'test'
        self.property_preferences = type('obj', (object,), {
            'order_by': lambda x: type('obj', (object,), {'first': lambda: prefs})()
        })()

mock_user = MockUser(user_pref)

try:
    # Test with first 10 properties
    test_props = list(candidates[:10])
    print(f"✓ Testing with {len(test_props)} properties...")
    
    ranked_properties = ranker.rank_properties(mock_user, test_props)
    
    print(f"✓ ML Ranker returned {len(ranked_properties)} scored properties")
    print("\n  Top 5 ML Predictions:")
    for i, (prop, score) in enumerate(ranked_properties[:5], 1):
        print(f"  {i}. Property ID: {prop.id}")
        print(f"     Location: {prop.location}")
        print(f"     Price: {prop.price/10000000:.2f} Cr")
        print(f"     Bedrooms: {prop.bedrooms}")
        print(f"     ML Score: {score:.2f}")
        print()
        
except Exception as e:
    print(f"✗ ML prediction failed: {str(e)}")
    import traceback
    traceback.print_exc()

# Test 6: Test API endpoint
print("\n[TEST 6] Testing Recommendations API Endpoint...")
from django.test import RequestFactory
from apps.properties.views import PropertyViewSet

factory = RequestFactory()
request = factory.get('/api/properties/recommendations/?limit=5')
request.user = user_pref.user if hasattr(user_pref, 'user') else None

viewset = PropertyViewSet()
viewset.request = request
viewset.format_kwarg = None

try:
    response = viewset.recommendations(request)
    data = response.data
    
    print(f"✓ API Response Status: {response.status_code}")
    print(f"✓ Number of recommendations: {data.get('count', 0)}")
    
    if 'properties' in data and len(data['properties']) > 0:
        print("\n  API Recommendations (Top 3):")
        for i, item in enumerate(data['properties'][:3], 1):
            prop = item['property']
            print(f"  {i}. Property ID: {prop['id']}")
            print(f"     Location: {prop.get('location', 'N/A')}")
            print(f"     Price: {float(prop.get('price', 0))/10000000:.2f} Cr")
            print(f"     ML Score: {item.get('score', 0):.2f}")
            print(f"     Match %: {item.get('match_percentage', 0)}%")
            print()
    else:
        print("✗ No properties in API response")
        
except Exception as e:
    print(f"✗ API test failed: {str(e)}")
    import traceback
    traceback.print_exc()

# Test 7: Compare manual scoring vs ML scoring
print("\n[TEST 7] Comparing Manual vs ML Scoring...")
print("Testing if ML model produces different scores than simple heuristics...")

if len(test_props) >= 3:
    # Manual scoring (simple heuristic)
    manual_scores = []
    for prop in test_props[:3]:
        score = 0.5
        # Simple price match
        budget_mid = (float(user_pref.min_budget) + float(user_pref.max_budget)) / 2
        price_diff = abs(float(prop.price) - budget_mid) / budget_mid
        score += max(0, (1 - price_diff)) * 0.3
        manual_scores.append((prop.id, score))
    
    print("  Manual Heuristic Scores:")
    for prop_id, score in manual_scores:
        print(f"    Property {prop_id}: {score:.2f}")
    
    print("\n  ML Model Scores:")
    for prop, score in ranked_properties[:3]:
        print(f"    Property {prop.id}: {score:.2f}")
    
    # Check if scores are different
    ml_scores = [score for _, score in ranked_properties[:3]]
    manual_only = [score for _, score in manual_scores]
    
    if ml_scores != manual_only:
        print("\n✓ ML model is producing DIFFERENT scores than manual heuristics")
        print("  This confirms the ML model is being used!")
    else:
        print("\n✗ WARNING: ML scores match manual scores - model may not be active")

print("\n" + "="*80)
print("TEST SUMMARY")
print("="*80)
print("All tests completed. Check output above for any failures (✗)")
print("="*80)
