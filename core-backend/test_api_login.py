#!/usr/bin/env python
"""
Test API login directly to diagnose authentication issue
"""

import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'residea_backend.settings')
sys.path.insert(0, os.path.dirname(__file__))
django.setup()

from django.contrib.auth import get_user_model, authenticate
from rest_framework.test import APIClient
from rest_framework_simplejwt.tokens import RefreshToken
import json

User = get_user_model()

def test_login_api():
    """Test login via API"""
    print("="*60)
    print("  TESTING API LOGIN")
    print("="*60)
    
    # Get test user
    try:
        user = User.objects.get(email='testbuyer@residea.ai')
        print(f"✓ Found user: {user.email}")
        print(f"  Username: {user.username}")
        print(f"  Active: {user.is_active}")
        print(f"  Has usable password: {user.has_usable_password()}")
    except User.DoesNotExist:
        print("✗ User not found")
        return
    
    # Test Django authentication
    print("\n1. Testing Django authenticate():")
    auth_user = authenticate(username='testbuyer@residea.ai', password='testpass123')
    if auth_user:
        print(f"   ✓ Django auth SUCCESS with email")
    else:
        print(f"   ✗ Django auth FAILED with email")
        # Try with username
        auth_user = authenticate(username='testbuyer', password='testpass123')
        if auth_user:
            print(f"   ✓ Django auth SUCCESS with username")
        else:
            print(f"   ✗ Django auth FAILED with username")
    
    # Test JWT token generation
    print("\n2. Testing JWT token generation:")
    try:
        refresh = RefreshToken.for_user(user)
        print(f"   ✓ JWT token generated successfully")
        print(f"   Access: {str(refresh.access_token)[:50]}...")
    except Exception as e:
        print(f"   ✗ JWT token generation failed: {e}")
    
    # Test API endpoint
    print("\n3. Testing API endpoint /api/auth/login/:")
    client = APIClient()
    
    # Test with email
    response = client.post('/api/auth/login/', {
        'email': 'testbuyer@residea.ai',
        'password': 'testpass123'
    }, format='json')
    
    print(f"   Status Code: {response.status_code}")
    if response.status_code == 200:
        print(f"   ✓ Login SUCCESS with email field")
        try:
            data = response.json()
            print(f"   User: {data.get('user', {}).get('email')}")
        except:
            print(f"   Response: {response.content}")
    else:
        print(f"   ✗ Login FAILED with email field")
        try:
            print(f"   Response: {response.json()}")
        except:
            print(f"   Response: {response.content}")
        
        # Try with username field
        print("\n   Trying with 'username' field instead of 'email':")
        response = client.post('/api/auth/login/', {
            'username': 'testbuyer@residea.ai',
            'password': 'testpass123'
        }, format='json')
        
        print(f"   Status Code: {response.status_code}")
        if response.status_code == 200:
            print(f"   ✓ Login SUCCESS with username field")
            try:
                data = response.json()
                print(f"   User: {data.get('user', {}).get('email')}")
            except:
                print(f"   Response: {response.content}")
        else:
            print(f"   ✗ Login FAILED with username field")
            try:
                print(f"   Response: {response.json()}")
            except:
                print(f"   Response: {response.content}")
    
    print("\n" + "="*60)

if __name__ == "__main__":
    test_login_api()
