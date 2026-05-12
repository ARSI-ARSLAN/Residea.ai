#!/usr/bin/env python
"""
Fix authentication for test user
"""

import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'residea_backend.settings')
sys.path.insert(0, os.path.dirname(__file__))
django.setup()

from django.contrib.auth import get_user_model
from apps.preferences.models import UserPreference

User = get_user_model()

def fix_auth():
    """Fix authentication for test user"""
    print("="*60)
    print("  FIXING AUTHENTICATION")
    print("="*60)
    
    try:
        # Get or create test user
        user, created = User.objects.get_or_create(
            email='testbuyer@residea.ai',
            defaults={
                'username': 'testbuyer',
                'first_name': 'Test',
                'last_name': 'Buyer',
                'is_active': True,
                'is_staff': False,
                'is_superuser': False,
            }
        )
        
        if created:
            print("✓ Created new test user")
        else:
            print("✓ Found existing test user")
        
        # Set password
        user.set_password('testpass123')
        user.is_active = True
        user.save()
        print("✓ Password set and user activated")
        
        # Check/create preferences
        prefs, created = UserPreference.objects.get_or_create(
            user=user,
            defaults={
                'preferred_locations': ['Bahria Enclave', 'F-7'],
                'min_budget': 10000000,  # 1 crore
                'max_budget': 100000000,  # 10 crore
                'bedrooms': 3,
                'bathrooms': 2,
                'min_area': 1000,
                'max_area': 5000,
            }
        )
        
        if created:
            print("✓ Created user preferences")
        else:
            print("✓ User preferences exist")
        
        # Verify login works
        from django.contrib.auth import authenticate
        auth_user = authenticate(username='testbuyer@residea.ai', password='testpass123')
        
        if auth_user:
            print("✓ Authentication test PASSED")
            print(f"\n✅ User ready: {user.email}")
            print(f"   Password: testpass123")
            print(f"   Active: {user.is_active}")
            print(f"   Preferences: {prefs.preferred_locations}")
        else:
            print("✗ Authentication test FAILED")
            print("\nTrying with username instead of email...")
            auth_user = authenticate(username='testbuyer', password='testpass123')
            if auth_user:
                print("✓ Authentication works with username")
            else:
                print("✗ Authentication still fails")
        
    except Exception as e:
        print(f"✗ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    fix_auth()
