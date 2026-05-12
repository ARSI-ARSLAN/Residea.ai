"""
Test script to verify ML-based recommendations are working
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

# Create a test user and preferences
print("Creating test user and preferences...")
test_user, created = User.objects.get_or_create(
    email='test@example.com',
    defaults={'username': 'testuser'}
)

if created:
    test_user.set_password('testpass123')
    test_user.save()

# Create or update preferences
prefs, created = UserPreference.objects.update_or_create(
    user=test_user,
    defaults={
        'city': 'islamabad',
        'min_budget': 5000000,
        'max_budget': 10000000,
        'bedrooms': 3,
        'bathrooms': 2,
        'min_bedrooms': 2,
        'max_bedrooms': 4,
        'property_types': ['house', 'flat'],
        'preferred_locations': ['Fazaia', 'DHA', 'Bahria'],
        'hospital_importance': 0.8,
        'school_importance': 0.9,
        'metro_importance': 0.5,
        'park_importance': 0.6,
        'shopping_importance': 0.7,
        'restaurant_importance': 0.5,
    }
)

print(f"Test user preferences: {prefs}")
print(f"Budget: {prefs.min_budget} - {prefs.max_budget}")
print(f"Bedrooms: {prefs.bedrooms}")
print(f"Preferred locations: {prefs.preferred_locations}")

# Get properties
print("\nFetching properties...")
properties = Property.objects.filter(
    price__gte=prefs.min_budget * 0.8,
    price__lte=prefs.max_budget * 1.2,
    bedrooms__gte=prefs.min_bedrooms,
    bedrooms__lte=prefs.max_bedrooms
)[:50]

print(f"Found {properties.count()} candidate properties")

# Test feature engineering
print("\nTesting feature engineering...")
feature_engineer = FeatureEngineer()
sample_property = properties.first()

if sample_property:
    features = feature_engineer.prepare_ranking_features(sample_property, prefs)
    print(f"\nSample property: {sample_property.location}")
    print(f"Price: {sample_property.price}")
    print(f"Bedrooms: {sample_property.bedrooms}")
    print(f"Features shape: {features.shape}")
    print(f"Features: {features}")

# Test ML ranker
print("\n" + "="*60)
print("Testing ML-based ranking...")
print("="*60)

ranker = PropertyRanker()
ranked_properties = ranker.rank_properties(test_user, properties)

print(f"\nTop 10 ML-ranked recommendations:")
print("-" * 80)
for i, (prop, score) in enumerate(ranked_properties[:10], 1):
    print(f"{i}. Score: {score:.2f} | {prop.location}")
    print(f"   Price: PKR {prop.price:,.0f} | Beds: {prop.bedrooms} | Baths: {prop.bathrooms}")
    print(f"   School: {prop.school_score:.2f} | Hospital: {prop.hospital_score:.2f}")
    print()

print("\n✅ ML recommendations are working!")
