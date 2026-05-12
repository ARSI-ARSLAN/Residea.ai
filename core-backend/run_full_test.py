#!/usr/bin/env python
"""
Comprehensive End-to-End System Test
Tests all components: Database, API, Recommendations, ML Services
"""

import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'residea_backend.settings')
sys.path.insert(0, os.path.dirname(__file__))
django.setup()

from django.contrib.auth import get_user_model
from apps.properties.models import Property
from apps.preferences.models import UserPreference
from django.db.models import Q
import requests
import json

User = get_user_model()

def print_section(title):
    print("\n" + "="*80)
    print(f"  {title}")
    print("="*80)

def test_database():
    """Test database connectivity and data"""
    print_section("1. DATABASE VERIFICATION")
    
    # Check properties
    total_properties = Property.objects.count()
    print(f"✓ Total Properties: {total_properties}")
    
    # Check F-7 properties
    f7_properties = Property.objects.filter(
        Q(location__icontains='F-7') | 
        Q(location__icontains='F7') | 
        Q(location__icontains='F 7')
    )
    print(f"✓ F-7 Properties: {f7_properties.count()}")
    
    if f7_properties.exists():
        sample = f7_properties.first()
        print(f"  Sample: {sample.location} | PKR {sample.price:,.0f}")
    
    # Check locations
    locations = Property.objects.values_list('location', flat=True).distinct()[:10]
    print(f"✓ Sample Locations: {', '.join(list(locations)[:5])}")
    
    # Check users
    total_users = User.objects.count()
    print(f"✓ Total Users: {total_users}")
    
    return total_properties > 0

def test_user_preferences():
    """Test user preferences"""
    print_section("2. USER PREFERENCES VERIFICATION")
    
    try:
        user = User.objects.get(email='testbuyer@residea.ai')
        print(f"✓ Test User Found: {user.email}")
        
        prefs = UserPreference.objects.get(user=user)
        print(f"✓ Preferred Locations: {prefs.preferred_locations}")
        print(f"✓ Budget: PKR {prefs.min_budget:,.0f} - {prefs.max_budget:,.0f}")
        print(f"✓ Bedrooms: {prefs.bedrooms}")
        
        return True
    except User.DoesNotExist:
        print("✗ Test user not found")
        return False
    except UserPreference.DoesNotExist:
        print("✗ User preferences not found")
        return False

def test_recommendation_logic():
    """Test recommendation filtering logic"""
    print_section("3. RECOMMENDATION LOGIC TEST")
    
    try:
        user = User.objects.get(email='testbuyer@residea.ai')
        prefs = UserPreference.objects.get(user=user)
        
        # Test budget filtering
        print("\n📊 Budget Filter Test:")
        budget_matches = Property.objects.filter(
            price__gte=prefs.min_budget,
            price__lte=prefs.max_budget
        )
        print(f"  Properties in budget range: {budget_matches.count()}")
        
        # Test bedroom filtering
        print("\n🛏️ Bedroom Filter Test:")
        bedroom_matches = Property.objects.filter(
            bedrooms__gte=prefs.bedrooms - 1,
            bedrooms__lte=prefs.bedrooms + 1
        )
        print(f"  Properties with {prefs.bedrooms}±1 bedrooms: {bedroom_matches.count()}")
        
        # Test location filtering
        print("\n📍 Location Filter Test:")
        for loc in prefs.preferred_locations:
            loc_matches = Property.objects.filter(location__icontains=loc)
            print(f"  {loc}: {loc_matches.count()} properties")
        
        # Combined filter
        print("\n🎯 Combined Filter Test:")
        location_query = Q()
        for loc in prefs.preferred_locations:
            location_query |= Q(location__icontains=loc)
        
        combined_matches = Property.objects.filter(
            location_query,
            price__gte=prefs.min_budget,
            price__lte=prefs.max_budget,
            bedrooms__gte=prefs.bedrooms - 1,
            bedrooms__lte=prefs.bedrooms + 1
        )
        print(f"  Total matches (all filters): {combined_matches.count()}")
        
        if combined_matches.exists():
            print("\n  Sample Matches:")
            for prop in combined_matches[:3]:
                print(f"    • {prop.location} | {prop.bedrooms} bed | PKR {prop.price:,.0f}")
        
        return True
    except Exception as e:
        print(f"✗ Error: {e}")
        return False

def test_api_endpoints():
    """Test API endpoints"""
    print_section("4. API ENDPOINTS TEST")
    
    base_url = "http://localhost:8000/api"
    
    # Test properties endpoint
    print("\n📡 Testing /api/properties/")
    try:
        response = requests.get(f"{base_url}/properties/", timeout=5)
        print(f"  Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"  ✓ Response received: {len(data.get('results', []))} properties")
        else:
            print(f"  ✗ Error: {response.text[:200]}")
    except requests.exceptions.RequestException as e:
        print(f"  ✗ Connection error: {e}")
    
    # Test recommendations endpoint
    print("\n📡 Testing /api/recommendations/")
    try:
        # Try to get token first
        login_response = requests.post(
            f"{base_url}/auth/login/",
            json={"email": "testbuyer@residea.ai", "password": "testpass123"},
            timeout=5
        )
        
        if login_response.status_code == 200:
            token = login_response.json().get('access')
            headers = {"Authorization": f"Bearer {token}"}
            
            rec_response = requests.get(
                f"{base_url}/recommendations/",
                headers=headers,
                timeout=5
            )
            print(f"  Status: {rec_response.status_code}")
            if rec_response.status_code == 200:
                data = rec_response.json()
                print(f"  ✓ Recommendations received: {len(data.get('results', []))} properties")
            else:
                print(f"  ✗ Error: {rec_response.text[:200]}")
        else:
            print(f"  ✗ Login failed: {login_response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"  ✗ Connection error: {e}")

def test_ml_services():
    """Test ML services availability"""
    print_section("5. ML SERVICES VERIFICATION")
    
    try:
        from apps.ml_services.recommendation_engine import RecommendationEngine
        print("✓ RecommendationEngine module loaded")
        
        # Check if we can instantiate
        engine = RecommendationEngine()
        print("✓ RecommendationEngine instantiated")
        
        return True
    except ImportError as e:
        print(f"✗ Import error: {e}")
        return False
    except Exception as e:
        print(f"✗ Error: {e}")
        return False

def run_all_tests():
    """Run all tests"""
    print("\n" + "🚀"*40)
    print("  RESIDEA.AI - COMPREHENSIVE SYSTEM TEST")
    print("🚀"*40)
    
    results = {
        "Database": test_database(),
        "User Preferences": test_user_preferences(),
        "Recommendation Logic": test_recommendation_logic(),
        "ML Services": test_ml_services(),
    }
    
    # API tests (don't fail if server not running)
    test_api_endpoints()
    
    # Summary
    print_section("TEST SUMMARY")
    for test_name, passed in results.items():
        status = "✓ PASS" if passed else "✗ FAIL"
        print(f"{status}: {test_name}")
    
    total_passed = sum(results.values())
    total_tests = len(results)
    print(f"\nTotal: {total_passed}/{total_tests} tests passed")
    
    if total_passed == total_tests:
        print("\n🎉 ALL CORE TESTS PASSED! System is ready.")
    else:
        print("\n⚠️ Some tests failed. Please review above.")
    
    print("\n" + "="*80)

if __name__ == "__main__":
    run_all_tests()
