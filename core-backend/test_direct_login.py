#!/usr/bin/env python
"""
Test login API directly with curl-like request
"""

import os
import sys
import django
import json

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'residea_backend.settings')
sys.path.insert(0, os.path.dirname(__file__))
django.setup()

from django.test import Client
from django.contrib.auth import get_user_model

User = get_user_model()

def test_login_api():
    """Test login API endpoint directly"""
    print("="*60)
    print("  TESTING LOGIN API ENDPOINT")
    print("="*60)
    
    # Check user exists
    try:
        user = User.objects.get(email='testbuyer@residea.ai')
        print(f"\n✓ User exists: {user.email}")
        print(f"  Username: {user.username}")
        print(f"  Active: {user.is_active}")
        print(f"  Has usable password: {user.has_usable_password()}")
    except User.DoesNotExist:
        print("\n✗ User does not exist!")
        return
    
    # Test API endpoint
    client = Client()
    
    print("\n" + "-"*60)
    print("Test 1: Login with 'username' field (email as value)")
    print("-"*60)
    
    response = client.post(
        '/api/auth/login/',
        data=json.dumps({
            'username': 'testbuyer@residea.ai',
            'password': 'testpass123'
        }),
        content_type='application/json'
    )
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.content.decode()}")
    
    if response.status_code == 200:
        print("✓ Login SUCCESS!")
        data = response.json()
        print(f"  Access Token: {data.get('access', '')[:50]}...")
        print(f"  User: {data.get('user', {}).get('email')}")
    else:
        print("✗ Login FAILED")
        try:
            error_data = response.json()
            print(f"  Error: {error_data}")
        except:
            print(f"  Raw response: {response.content}")
    
    print("\n" + "-"*60)
    print("Test 2: Login with 'email' field")
    print("-"*60)
    
    response = client.post(
        '/api/auth/login/',
        data=json.dumps({
            'email': 'testbuyer@residea.ai',
            'password': 'testpass123'
        }),
        content_type='application/json'
    )
    
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        print("✓ Login SUCCESS with email field!")
    else:
        print("✗ Login FAILED with email field")
        try:
            error_data = response.json()
            print(f"  Error: {error_data}")
        except:
            print(f"  Raw response: {response.content}")
    
    print("\n" + "="*60)

if __name__ == "__main__":
    test_login_api()
