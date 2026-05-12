"""
Test script to debug G-11 location recommendations
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'residea_backend.settings')
django.setup()

from apps.properties.models import Property
from apps.preferences.models import UserPreference
from apps.users.models import User
from apps.ml_services.ranker import PropertyRanker
from apps.ml_services.feature_engineering import FeatureEngineer

# Create a test user with G-11 preference
print("="*80)
print("Testing G-11 Location Recommendations")
print("="*80)

test_user, created = User.objects.get_or_create(
    email='g11test@example.com',
    defaults={'username': 'g11testuser'}
)

if created:
    test_user.set_password('testpass123')
    test_user.save()

# Create preferences specifically for G-11
prefs, created = UserPreference.objects.update_or_create(
    user=test_user,
    defaults={
        'city': 'islamabad',
        'min_budget': 30000000,  # 30M
        'max_budget': 80000000,  # 80M
        'bedrooms': 4,
        'bathrooms': 3,
        'min_bedrooms': 3,
        'max_bedrooms': 5,
        'property_types': ['house'],
        'preferred_locations': ['G-11'],  # Specifically G-11
        'hospital_importance': 0.8,
        'school_importance': 0.9,
        'metro_importance': 0.5,
        'park_importance': 0.6,
        'shopping_importance': 0.7,
        'restaurant_importance': 0.5,
    }
)

print(f"\n✓ User preferences set:")
print(f"  Budget: PKR {prefs.min_budget:,.0f} - {prefs.max_budget:,.0f}")
print(f"  Bedrooms: {prefs.bedrooms}")
print(f"  Preferred locations: {prefs.preferred_locations}")

# Get G-11 properties
print(f"\n{'='*80}")
print("Step 1: Checking G-11 properties in database")
print(f"{'='*80}")

g11_properties = Property.objects.filter(location__icontains='G-11')
print(f"Total G-11 properties: {g11_properties.count()}")

# Filter by budget
budget_filtered = g11_properties.filter(
    price__gte=prefs.min_budget * 0.8,
    price__lte=prefs.max_budget * 1.2
)
print(f"Within budget range (±20%): {budget_filtered.count()}")

# Filter by bedrooms
bedroom_filtered = budget_filtered.filter(
    bedrooms__gte=prefs.min_bedrooms,
    bedrooms__lte=prefs.max_bedrooms
)
print(f"Matching bedroom requirements: {bedroom_filtered.count()}")

print(f"\nSample G-11 properties matching criteria:")
for i, prop in enumerate(bedroom_filtered[:5], 1):
    print(f"{i}. {prop.location}")
    print(f"   Price: PKR {prop.price:,.0f} | Beds: {prop.bedrooms} | Baths: {prop.bathrooms}")
    print(f"   School: {prop.school_score:.2f} | Hospital: {prop.hospital_score:.2f}")

# Test feature engineering for G-11 property
print(f"\n{'='*80}")
print("Step 2: Testing feature engineering for G-11 property")
print(f"{'='*80}")

if bedroom_filtered.exists():
    sample_prop = bedroom_filtered.first()
    feature_engineer = FeatureEngineer()
    features = feature_engineer.prepare_ranking_features(sample_prop, prefs)
    
    print(f"\nSample property: {sample_prop.location}")
    print(f"Price: PKR {sample_prop.price:,.0f}")
    print(f"Bedrooms: {sample_prop.bedrooms}")
    print(f"\nFeature vector (11 features):")
    feature_names = [
        'price_fit_score',
        'bedroom_match',
        'area_match_score',
        'location_match_score',
        'school_score',
        'hospital_score',
        'metro_score',
        'park_score',
        'facility_match_ratio',
        'risk_adjusted_safety',
        'risk_adjusted_roi'
    ]
    for name, value in zip(feature_names, features[0]):
        print(f"  {name:25s}: {value:.4f}")
    
    # Check location matching
    print(f"\n✓ Location match analysis:")
    property_location = sample_prop.location.lower()
    preferred_locations = [loc.lower() for loc in prefs.preferred_locations]
    print(f"  Property location: '{property_location}'")
    print(f"  Preferred locations: {preferred_locations}")
    
    location_matched = False
    for pref_loc in preferred_locations:
        if pref_loc in property_location:
            print(f"  ✓ MATCH FOUND: '{pref_loc}' in '{property_location}'")
            location_matched = True
            break
    
    if not location_matched:
        print(f"  ✗ NO MATCH: None of {preferred_locations} found in '{property_location}'")

# Test ML ranker
print(f"\n{'='*80}")
print("Step 3: Testing ML Ranker with G-11 properties")
print(f"{'='*80}")

ranker = PropertyRanker()

# Get broader set of properties for comparison
all_candidates = Property.objects.filter(
    price__gte=prefs.min_budget * 0.8,
    price__lte=prefs.max_budget * 1.2,
    bedrooms__gte=prefs.min_bedrooms,
    bedrooms__lte=prefs.max_bedrooms
)[:100]

print(f"\nRanking {all_candidates.count()} candidate properties...")
ranked_properties = ranker.rank_properties(test_user, all_candidates)

print(f"\n{'='*80}")
print("Top 15 ML-Ranked Recommendations:")
print(f"{'='*80}")

g11_count = 0
other_count = 0

for i, (prop, score) in enumerate(ranked_properties[:15], 1):
    is_g11 = 'g-11' in prop.location.lower()
    marker = "🎯 G-11" if is_g11 else "     "
    
    if is_g11:
        g11_count += 1
    else:
        other_count += 1
    
    print(f"{i:2d}. {marker} | Score: {score:5.2f} | {prop.location}")
    print(f"     Price: PKR {prop.price:,.0f} | Beds: {prop.bedrooms} | Baths: {prop.bathrooms}")
    print(f"     School: {prop.school_score:.2f} | Hospital: {prop.hospital_score:.2f}")
    print()

print(f"{'='*80}")
print(f"Summary:")
print(f"  G-11 properties in top 15: {g11_count}")
print(f"  Other locations in top 15: {other_count}")
print(f"{'='*80}")

# Check if G-11 properties are being scored correctly
print(f"\n{'='*80}")
print("Step 4: Analyzing G-11 vs Non-G-11 scores")
print(f"{'='*80}")

g11_scores = [(prop, score) for prop, score in ranked_properties if 'g-11' in prop.location.lower()]
non_g11_scores = [(prop, score) for prop, score in ranked_properties if 'g-11' not in prop.location.lower()]

if g11_scores:
    avg_g11_score = sum(score for _, score in g11_scores) / len(g11_scores)
    max_g11_score = max(score for _, score in g11_scores)
    print(f"\nG-11 properties ({len(g11_scores)} total):")
    print(f"  Average score: {avg_g11_score:.2f}")
    print(f"  Max score: {max_g11_score:.2f}")
    print(f"\n  Top 5 G-11 properties:")
    for i, (prop, score) in enumerate(g11_scores[:5], 1):
        print(f"    {i}. Score: {score:.2f} | {prop.location} | PKR {prop.price:,.0f}")

if non_g11_scores:
    avg_non_g11_score = sum(score for _, score in non_g11_scores) / len(non_g11_scores)
    max_non_g11_score = max(score for _, score in non_g11_scores)
    print(f"\nNon-G-11 properties ({len(non_g11_scores)} total):")
    print(f"  Average score: {avg_non_g11_score:.2f}")
    print(f"  Max score: {max_non_g11_score:.2f}")

# Diagnosis
print(f"\n{'='*80}")
print("DIAGNOSIS:")
print(f"{'='*80}")

if g11_count == 0:
    print("❌ ISSUE: No G-11 properties in top 15 recommendations")
    print("\nPossible causes:")
    print("1. Location matching not working correctly")
    print("2. G-11 properties have lower amenity scores")
    print("3. ML model not weighting location match highly enough")
    print("4. Budget/bedroom filters excluding G-11 properties")
elif g11_count < 5:
    print("⚠️  WARNING: Only a few G-11 properties in top 15")
    print("   Location preference may not be weighted strongly enough")
else:
    print("✅ SUCCESS: G-11 properties are being recommended")

print(f"\n{'='*80}")
