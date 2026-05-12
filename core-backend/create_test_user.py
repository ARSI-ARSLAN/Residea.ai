#!/usr/bin/env python
"""Create test user and test recommendations"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'residea_backend.settings')
django.setup()

from django.contrib.auth import get_user_model
from apps.preferences.models import UserPreference
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

# Clean up and create fresh test user
print("=== CREATING TEST USER ===")
User.objects.filter(username='testbuyer').delete()

user = User.objects.create_user(
    username='testbuyer',
    email='testbuyer@residea.ai',
    password='TestPass123!',
    first_name='Test',
    last_name='Buyer'
)
print(f'✓ User created: {user.email} (ID: {user.id})')

# Create preferences (F-7, 1-10 crore, 3 bedrooms)
prefs, created = UserPreference.objects.update_or_create(
    user=user,
    defaults={
        'city': 'islamabad',
        'min_budget': 10000000,
        'max_budget': 100000000,
        'preferred_locations': ['F-7'],
        'property_types': ['house'],
        'profession': 'engineer',
        'timeline': '6months',
        'bedrooms': 3,
        'bathrooms': 2,
        'min_bedrooms': 2,
        'max_bedrooms': 4,
        'min_bathrooms': 1,
        'min_area_sqft': 1000
    }
)

print(f'✓ Preferences {"created" if created else "updated"}:')
print(f'  Budget: PKR {prefs.min_budget:,} - {prefs.max_budget:,}')
print(f'  Bedrooms: {prefs.bedrooms}')
print(f'  Locations: {prefs.preferred_locations}')
print(f'  Types: {prefs.property_types}')

# Generate token
refresh = RefreshToken.for_user(user)
access_token = str(refresh.access_token)

print(f'\n=== TEST CREDENTIALS ===')
print(f'Email: testbuyer@residea.ai')
print(f'Password: TestPass123!')
print(f'\nJWT Token:')
print(access_token)

# Test recommendations
print(f'\n=== TESTING RECOMMENDATIONS ===')
from apps.properties.models import Property

total_properties = Property.objects.count()
print(f'Total properties in database: {total_properties}')

# Filter by budget
budget_filtered = Property.objects.filter(
    price__gte=prefs.min_budget * 0.8,
    price__lte=prefs.max_budget * 1.2
)
print(f'Properties in budget range (0.8-12 crore): {budget_filtered.count()}')

# Filter by bedrooms
bedroom_filtered = budget_filtered.filter(
    bedrooms__gte=2,
    bedrooms__lte=4
)
print(f'Properties with 2-4 bedrooms: {bedroom_filtered.count()}')

# Filter by location
from django.db.models import Q
location_filtered = bedroom_filtered.filter(Q(location__icontains='F-7'))
print(f'Properties in F-7: {location_filtered.count()}')

if location_filtered.exists():
    print(f'\nSample matching properties:')
    for prop in location_filtered[:3]:
        print(f'  - {prop.title}')
        print(f'    Price: PKR {prop.price:,}, Bedrooms: {prop.bedrooms}, Location: {prop.location}')
