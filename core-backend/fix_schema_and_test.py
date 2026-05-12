#!/usr/bin/env python
"""Fix database schema and create test user for testing recommendations"""

import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'residea_backend.settings')
django.setup()

from django.db import connection
from django.contrib.auth import get_user_model
from apps.preferences.models import UserPreference
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

def fix_schema():
    """Add missing columns to user_preferences table"""
    cursor = connection.cursor()
    
    missing_columns = [
        ('profession', 'VARCHAR(50) DEFAULT ""'),
        ('timeline', 'VARCHAR(50) DEFAULT ""'),
    ]
    
    print("=== FIXING DATABASE SCHEMA ===")
    for col_name, col_type in missing_columns:
        try:
            cursor.execute(f'ALTER TABLE user_preferences ADD COLUMN {col_name} {col_type}')
            print(f'✓ Added column: {col_name}')
        except Exception as e:
            if 'duplicate column name' in str(e).lower():
                print(f'  Column {col_name} already exists')
            else:
                print(f'✗ Error adding {col_name}: {e}')
    
    connection.commit()
    
    # Show final schema
    cursor.execute('PRAGMA table_info(user_preferences)')
    columns = cursor.fetchall()
    print('\nCurrent columns in user_preferences:')
    for col in columns:
        print(f'  - {col[1]} ({col[2]})')

def create_test_user():
    """Create test user with preferences matching user requirements"""
    print("\n=== CREATING TEST USER ===")
    
    # Delete existing test user
    User.objects.filter(email='testbuyer@residea.ai').delete()
    print("✓ Cleaned up existing test user")
    
    # Create user
    user = User.objects.create_user(
        username='testbuyer',
        email='testbuyer@residea.ai',
        password='TestPass123!',
        first_name='Test',
        last_name='Buyer'
    )
    print(f'✓ User created: {user.email} (ID: {user.id})')
    
    # Create preferences (F-7, 1-10 crore, 3 bedrooms)
    prefs = UserPreference.objects.create(
        user=user,
        city='islamabad',
        min_budget=10000000,  # 1 crore
        max_budget=100000000,  # 10 crore
        preferred_locations=['F-7'],
        property_types=['house'],
        profession='engineer',
        timeline='6months',
        bedrooms=3,
        bathrooms=2,
        min_bedrooms=2,
        max_bedrooms=4,
        min_bathrooms=1,
        min_area_sqft=1000
    )
    
    print(f'✓ Preferences saved:')
    print(f'  Budget: PKR {prefs.min_budget:,} - {prefs.max_budget:,}')
    print(f'  Bedrooms: {prefs.bedrooms} (range: {prefs.min_bedrooms}-{prefs.max_bedrooms})')
    print(f'  Bathrooms: {prefs.bathrooms}')
    print(f'  Locations: {prefs.preferred_locations}')
    print(f'  Property Types: {prefs.property_types}')
    print(f'  Profession: {prefs.profession}')
    print(f'  Timeline: {prefs.timeline}')
    
    # Generate JWT token
    refresh = RefreshToken.for_user(user)
    access_token = str(refresh.access_token)
    
    print(f'\n✓ JWT Token generated')
    print(f'  Token (first 60 chars): {access_token[:60]}...')
    
    return user, access_token

if __name__ == '__main__':
    fix_schema()
    user, token = create_test_user()
    
    print("\n=== READY FOR TESTING ===")
    print(f"Email: testbuyer@residea.ai")
    print(f"Password: TestPass123!")
    print(f"\nUse this token for API testing:")
    print(f"Authorization: Bearer {token}")
