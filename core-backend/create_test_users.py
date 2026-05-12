"""
Script to create test users with preferences for testing recommendations
Compatible with actual database schema
"""
from django.contrib.auth import get_user_model
from apps.preferences.models import UserPreference

User = get_user_model()

# Create test users
users_data = [
    {
        'email': 'buyer1@test.com',
        'username': 'buyer1',
        'password': 'TestPass123!',
        'first_name': 'Ahmed',
        'last_name': 'Khan',
        'user_type': 'buyer',
        'preferences': {
            'min_budget': 3000000,
            'max_budget': 6000000,
            'bedrooms': 3,
            'bathrooms': 2,
            'min_bedrooms': 2,
            'max_bedrooms': 4,
            'min_bathrooms': 2,
            'min_area_sqft': 1200,
            'property_types': ['House', 'Apartment'],
            'preferred_locations': ['F-10', 'F-11', 'G-11'],
            'purpose': 'living',
            'hospital_importance': 0.8,
            'school_importance': 0.9,
            'shopping_importance': 0.6,
            'park_importance': 0.7,
        }
    },
    {
        'email': 'investor1@test.com',
        'username': 'investor1',
        'password': 'TestPass123!',
        'first_name': 'Sarah',
        'last_name': 'Ahmed',
        'user_type': 'investor',
        'preferences': {
            'min_budget': 10000000,
            'max_budget': 50000000,
            'bedrooms': 4,
            'bathrooms': 3,
            'min_bedrooms': 3,
            'max_bedrooms': 6,
            'min_bathrooms': 3,
            'min_area_sqft': 2500,
            'property_types': ['House', 'Villa'],
            'preferred_locations': ['Bahria Town', 'DHA'],
            'purpose': 'investment',
            'hospital_importance': 0.5,
            'school_importance': 0.4,
            'shopping_importance': 0.7,
            'metro_importance': 0.6,
        }
    },
    {
        'email': 'family1@test.com',
        'username': 'family1',
        'password': 'TestPass123!',
        'first_name': 'Ali',
        'last_name': 'Hassan',
        'user_type': 'buyer',
        'preferences': {
            'min_budget': 5000000,
            'max_budget': 12000000,
            'bedrooms': 4,
            'bathrooms': 3,
            'min_bedrooms': 3,
            'max_bedrooms': 5,
            'min_bathrooms': 2,
            'min_area_sqft': 1800,
            'property_types': ['House'],
            'preferred_locations': ['G-13', 'I-8', 'E-11'],
            'purpose': 'living',
            'hospital_importance': 0.9,
            'school_importance': 1.0,
            'park_importance': 0.8,
            'security_importance': 0.9,
        }
    }
]

created_users = []

for user_data in users_data:
    # Create user
    user, created = User.objects.get_or_create(
        email=user_data['email'],
        defaults={
            'username': user_data['username'],
            'first_name': user_data['first_name'],
            'last_name': user_data['last_name'],
            'user_type': user_data['user_type'],
        }
    )
    
    if created:
        user.set_password(user_data['password'])
        user.save()
        print(f"✓ Created user: {user.email}")
    else:
        print(f"→ User already exists: {user.email}")
    
    # Create or update preferences
    prefs_data = user_data['preferences']
    prefs, prefs_created = UserPreference.objects.update_or_create(
        user=user,
        defaults=prefs_data
    )
    
    if prefs_created:
        print(f"  ✓ Created preferences for {user.email}")
    else:
        print(f"  → Updated preferences for {user.email}")
    
    created_users.append({
        'user': user,
        'preferences': prefs
    })

print(f"\n{'='*50}")
print(f"Summary:")
print(f"Total users in database: {User.objects.count()}")
print(f"Total preferences in database: {UserPreference.objects.count()}")
print(f"{'='*50}")

# Print user details
for item in created_users:
    user = item['user']
    prefs = item['preferences']
    print(f"\n{user.first_name} {user.last_name} ({user.email})")
    print(f"  Budget: PKR {prefs.min_budget:,} - {prefs.max_budget:,}")
    print(f"  Bedrooms: {prefs.bedrooms}, Bathrooms: {prefs.bathrooms}")
    print(f"  Preferred areas: {', '.join(prefs.preferred_locations)}")
    print(f"  Purpose: {prefs.purpose}")
