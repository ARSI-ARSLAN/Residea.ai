"""
Test G-11 recommendations via the actual API endpoint
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'residea_backend.settings')
django.setup()

from apps.properties.models import Property
from apps.preferences.models import UserPreference
from apps.users.models import User
from django.test import RequestFactory
from apps.properties.views import PropertyViewSet
from rest_framework.test import force_authenticate

print("="*80)
print("Testing G-11 Recommendations via API")
print("="*80)

# Get or create test user
test_user, created = User.objects.get_or_create(
    email='g11api@example.com',
    defaults={'username': 'g11apiuser'}
)

if created:
    test_user.set_password('testpass123')
    test_user.save()

# Create G-11 preferences
prefs, created = UserPreference.objects.update_or_create(
    user=test_user,
    defaults={
        'city': 'islamabad',
        'min_budget': 30000000,
        'max_budget': 80000000,
        'bedrooms': 4,
        'bathrooms': 3,
        'min_bedrooms': 3,
        'max_bedrooms': 5,
        'property_types': ['house'],
        'preferred_locations': ['G-11'],
        'hospital_importance': 0.8,
        'school_importance': 0.9,
        'metro_importance': 0.5,
        'park_importance': 0.6,
        'shopping_importance': 0.7,
        'restaurant_importance': 0.5,
    }
)

print(f"\n[OK] Test user: {test_user.email}")
print(f"[OK] Preferences: Budget PKR {prefs.min_budget:,.0f} - {prefs.max_budget:,.0f}")
print(f"[OK] Preferred locations: {prefs.preferred_locations}")

# Simulate API request
factory = RequestFactory()
request = factory.get('/api/properties/recommendations/?limit=10')
force_authenticate(request, user=test_user)

# Call the view
view = PropertyViewSet.as_view({'get': 'recommendations'})
response = view(request)

print(f"\n{'='*80}")
print("API Response:")
print(f"{'='*80}")
print(f"Status Code: {response.status_code}")

if response.status_code == 200:
    data = response.data
    print(f"Count: {data.get('count', 0)}")
    
    properties = data.get('properties', [])
    
    if properties:
        print(f"\nTop {len(properties)} Recommendations:")
        print("-" * 80)
        
        g11_count = 0
        for i, rec in enumerate(properties, 1):
            prop = rec.get('property', {})
            location = prop.get('location', 'Unknown')
            is_g11 = 'g-11' in location.lower()
            
            if is_g11:
                g11_count += 1
                marker = "[G-11]"
            else:
                marker = "      "
            
            print(f"{i:2d}. {marker} Score: {rec.get('score', 0):.2f} | Match: {rec.get('match_percentage', 0)}%")
            print(f"     {location}")
            print(f"     PKR {float(prop.get('price', 0)):,.0f} | {prop.get('bedrooms', 0)} beds | {prop.get('bathrooms', 0)} baths")
            print(f"     ROI: 1yr={rec.get('roi_1yr', 0):.1f}%, 5yr={rec.get('roi_5yr', 0):.1f}%")
            print()
        
        print(f"{'='*80}")
        print(f"G-11 properties in recommendations: {g11_count}/{len(properties)}")
        print(f"{'='*80}")
        
        if g11_count == len(properties):
            print("[SUCCESS] All recommendations are from G-11!")
        elif g11_count > 0:
            print(f"[PARTIAL] {g11_count} out of {len(properties)} are from G-11")
        else:
            print("[ISSUE] No G-11 properties in recommendations")
    else:
        print("No properties returned")
else:
    print(f"Error: {response.data}")
