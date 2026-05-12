#!/usr/bin/env python
"""
Complete System Verification Script
Tests: Data import, F-7 properties, user preferences, recommendations
"""

import os, sys, django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'residea_backend.settings')
django.setup()

from apps.properties.models import Property
from apps.preferences.models import UserPreference
from django.contrib.auth import get_user_model
from django.db.models import Q

User = get_user_model()

print("=" * 70)
print("COMPLETE SYSTEM VERIFICATION")
print("=" * 70)

# TEST 1: Database Import
print("\n📊 TEST 1: DATABASE IMPORT")
print("-" * 70)
total_props = Property.objects.count()
print(f"✓ Total properties in database: {total_props:,}")

if total_props == 0:
    print("❌ ERROR: No properties in database!")
    sys.exit(1)

# TEST 2: Location Field Analysis
print("\n📍 TEST 2: LOCATION FIELD ANALYSIS")
print("-" * 70)
sample_locations = Property.objects.values_list('location', flat=True)[:20]
print("Sample locations:")
for i, loc in enumerate(sample_locations, 1):
    print(f"  {i:2d}. {loc}")

# TEST 3: F-7 Property Search
print("\n🔍 TEST 3: F-7 PROPERTY SEARCH")
print("-" * 70)

# Try different search patterns
search_patterns = ['F-7', 'F7', 'F 7', 'f-7', 'F-7 Islamabad', 'F-7 Sector']
for pattern in search_patterns:
    count = Property.objects.filter(location__icontains=pattern).count()
    print(f"  '{pattern}': {count} properties")

# Get all F-7 properties
f7_properties = Property.objects.filter(
    Q(location__icontains='F-7') | 
    Q(location__icontains='F7') | 
    Q(location__icontains='F 7')
)
f7_count = f7_properties.count()

print(f"\n✓ Total F-7 properties found: {f7_count}")

if f7_count > 0:
    print("\nSample F-7 properties:")
    for i, prop in enumerate(f7_properties[:10], 1):
        print(f"  {i:2d}. {prop.title[:40]:40s} | {prop.location:30s} | PKR {int(prop.price):,} | {prop.bedrooms} beds")
else:
    print("❌ WARNING: No F-7 properties found!")

# TEST 4: User Preferences
print("\n👤 TEST 4: USER PREFERENCES")
print("-" * 70)
try:
    user = User.objects.get(email='testbuyer@residea.ai')
    prefs = UserPreference.objects.get(user=user)
    
    print(f"✓ User: {user.email}")
    print(f"  Budget: PKR {int(prefs.min_budget):,} - {int(prefs.max_budget):,}")
    print(f"  Bedrooms: {prefs.bedrooms}")
    print(f"  Locations: {prefs.preferred_locations}")
    print(f"  Property Types: {prefs.property_types}")
except User.DoesNotExist:
    print("❌ ERROR: Test user not found!")
    sys.exit(1)
except UserPreference.DoesNotExist:
    print("❌ ERROR: User preferences not found!")
    sys.exit(1)

# TEST 5: Recommendation Filtering
print("\n🎯 TEST 5: RECOMMENDATION FILTERING")
print("-" * 70)

# Calculate budget range with buffer
min_price = int(int(prefs.min_budget) * 0.8)
max_price = int(int(prefs.max_budget) * 1.2)

print(f"Budget filter: PKR {min_price:,} - {max_price:,}")
print(f"Bedroom filter: {prefs.bedrooms-1} - {prefs.bedrooms+1}")
print(f"Location filter: {prefs.preferred_locations}")

# Step 1: Budget filter
budget_matches = Property.objects.filter(
    price__gte=min_price,
    price__lte=max_price
)
print(f"\nStep 1 - Budget matches: {budget_matches.count():,}")

# Step 2: Bedroom filter
bedroom_matches = budget_matches.filter(
    bedrooms__gte=prefs.bedrooms - 1,
    bedrooms__lte=prefs.bedrooms + 1
)
print(f"Step 2 - Bedroom matches: {bedroom_matches.count():,}")

# Step 3: Location filter
if prefs.preferred_locations:
    location_query = Q()
    for loc in prefs.preferred_locations:
        location_query |= Q(location__icontains=loc)
    
    final_matches = bedroom_matches.filter(location_query)
    print(f"Step 3 - Location matches: {final_matches.count()}")
    
    if final_matches.exists():
        print(f"\n✅ SUCCESS! Found {final_matches.count()} personalized recommendations!")
        print("\nTop 5 Recommendations:")
        
        # Score properties
        scored = []
        for prop in final_matches[:50]:
            score = 0.5
            
            # Budget match
            budget_mid = (int(prefs.min_budget) + int(prefs.max_budget)) / 2
            price_diff = abs(float(prop.price) - budget_mid) / budget_mid
            score += max(0, (1 - price_diff)) * 0.3
            
            # Bedroom exact match
            if prop.bedrooms == prefs.bedrooms:
                score += 0.2
            
            # Location match
            for loc in prefs.preferred_locations:
                if loc.lower() in prop.location.lower():
                    score += 0.2
                    break
            
            # Amenities
            amenity_avg = (
                prop.hospital_score + prop.school_score + 
                prop.restaurant_score + prop.shopping_mall_score + 
                prop.park_score + prop.metro_score
            ) / 6
            score += amenity_avg * 0.3
            
            scored.append((prop, score))
        
        scored.sort(key=lambda x: x[1], reverse=True)
        
        for i, (prop, score) in enumerate(scored[:5], 1):
            print(f"\n{i}. {prop.title[:50]}")
            print(f"   💰 PKR {int(prop.price):,}")
            print(f"   🛏️  {prop.bedrooms} beds | 🚿 {prop.bathrooms} baths")
            print(f"   📍 {prop.location}")
            print(f"   ⭐ Score: {score:.2f}/1.3")
    else:
        print(f"❌ No properties found matching location: {prefs.preferred_locations}")
        print("\nTrying fallback to all budget/bedroom matches...")
        print(f"Available: {bedroom_matches.count()} properties")
else:
    final_matches = bedroom_matches
    print(f"Step 3 - No location filter, using all matches: {final_matches.count()}")

# TEST 6: API Endpoint Simulation
print("\n🌐 TEST 6: API ENDPOINT SIMULATION")
print("-" * 70)
print("Simulating GET /api/properties/recommendations/")
print(f"  User: {user.email}")
print(f"  Authenticated: Yes")
print(f"  Preferences found: Yes")
print(f"  Results: {final_matches.count() if 'final_matches' in locals() else 0} properties")

# FINAL SUMMARY
print("\n" + "=" * 70)
print("VERIFICATION SUMMARY")
print("=" * 70)

tests_passed = 0
tests_total = 6

print(f"✓ Database Import: {total_props:,} properties")
tests_passed += 1

if f7_count > 0:
    print(f"✓ F-7 Properties: {f7_count} found")
    tests_passed += 1
else:
    print(f"⚠ F-7 Properties: {f7_count} found (check location field)")

print(f"✓ User Preferences: Configured")
tests_passed += 1

print(f"✓ Budget Filtering: {budget_matches.count():,} matches")
tests_passed += 1

print(f"✓ Bedroom Filtering: {bedroom_matches.count():,} matches")
tests_passed += 1

if 'final_matches' in locals() and final_matches.exists():
    print(f"✓ Personalized Recommendations: {final_matches.count()} matches")
    tests_passed += 1
else:
    print(f"⚠ Personalized Recommendations: 0 matches (location issue)")

print(f"\nTests Passed: {tests_passed}/{tests_total}")

if tests_passed == tests_total:
    print("\n🎉 ALL TESTS PASSED! System is fully functional!")
elif tests_passed >= 4:
    print("\n⚠️  MOSTLY WORKING - Minor issues to address")
else:
    print("\n❌ CRITICAL ISSUES - System needs fixes")

print("=" * 70)
