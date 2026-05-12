#!/usr/bin/env python
"""
Import property data from CSV files into the database
Imports: properties_clean.csv, preference_enriched.csv, match_pref_0.csv
"""

import os
import sys
import django
import pandas as pd
from decimal import Decimal

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'residea_backend.settings')
django.setup()

from apps.properties.models import Property
from django.db import transaction

def import_properties_clean(csv_path):
    """Import main property data from properties_clean.csv"""
    print(f"\n=== IMPORTING PROPERTIES FROM {csv_path} ===")
    
    # Read CSV
    df = pd.read_csv(csv_path)
    print(f"Found {len(df)} properties in CSV")
    
    # Count F-7 properties
    f7_count = df[df['location'].str.contains('F-7', case=False, na=False)].shape[0]
    print(f"Properties with F-7 in location: {f7_count}")
    
    # Clear existing properties
    existing_count = Property.objects.count()
    print(f"Existing properties in database: {existing_count}")
    
    response = input("Clear existing properties and import fresh? (yes/no): ")
    if response.lower() == 'yes':
        Property.objects.all().delete()
        print("✓ Cleared existing properties")
    
    # Import properties
    imported = 0
    skipped = 0
    errors = []
    
    with transaction.atomic():
        for idx, row in df.iterrows():
            try:
                # Extract data with safe defaults - only include fields that exist in model
                property_data = {
                    'title': str(row.get('Description', 'Property'))[:200],
                    'location': str(row.get('clean_location', row.get('location', 'Unknown')))[:200],
                    'price': Decimal(str(row.get('clean_price', 0))),
                    'bedrooms': int(row.get('bedrooms', 0)) if pd.notna(row.get('bedrooms')) else 0,
                    'bathrooms': int(row.get('bathrooms', 0)) if pd.notna(row.get('bathrooms')) else 0,
                    'area_sqft': int(row.get('clean_area', 0)) if pd.notna(row.get('clean_area')) else 0,
                    'property_type': str(row.get('property_type', 'house')),
                    
                    # Amenity scores
                    'hospital_score': float(row.get('hospital_score', 0)) if pd.notna(row.get('hospital_score')) else 0.0,
                    'school_score': float(row.get('school_score', 0)) if pd.notna(row.get('school_score')) else 0.0,
                    'restaurant_score': float(row.get('restaurant_score', 0)) if pd.notna(row.get('restaurant_score')) else 0.0,
                    'shopping_mall_score': float(row.get('shopping_mall_score', 0)) if pd.notna(row.get('shopping_mall_score')) else 0.0,
                    'park_score': float(row.get('park_score', 0)) if pd.notna(row.get('park_score')) else 0.0,
                    'metro_score': float(row.get('metro_score', 0)) if pd.notna(row.get('metro_score')) else 0.0,
                    
                    # Location data
                    'latitude': float(row.get('latitude', 0)) if pd.notna(row.get('latitude')) else None,
                    'longitude': float(row.get('longitude', 0)) if pd.notna(row.get('longitude')) else None,
                }
                
                # Create property
                Property.objects.create(**property_data)
                imported += 1
                
                # Progress indicator
                if imported % 500 == 0:
                    print(f"  Imported {imported} properties...")
                    
            except Exception as e:
                skipped += 1
                errors.append(f"Row {idx}: {str(e)[:100]}")
                if len(errors) <= 5:  # Only store first 5 errors
                    print(f"  Error on row {idx}: {e}")
    
    print(f"\n✓ Import complete!")
    print(f"  Imported: {imported}")
    print(f"  Skipped: {skipped}")
    
    # Verify F-7 properties
    f7_in_db = Property.objects.filter(location__icontains='F-7').count()
    print(f"\nF-7 properties in database: {f7_in_db}")
    
    if f7_in_db > 0:
        print("\nSample F-7 properties:")
        for prop in Property.objects.filter(location__icontains='F-7')[:5]:
            print(f"  - {prop.title[:50]} | {prop.location} | PKR {prop.price:,}")
    
    return imported, skipped


def import_preference_enriched(csv_path):
    """Import preference enriched data (security scores, etc.)"""
    print(f"\n=== IMPORTING PREFERENCE DATA FROM {csv_path} ===")
    
    try:
        df = pd.read_csv(csv_path)
        print(f"Found {len(df)} rows in preference enriched CSV")
        
        # Update existing properties with enriched data
        updated = 0
        for idx, row in df.iterrows():
            try:
                # Match by location or other unique identifier
                location = str(row.get('clean_location', row.get('location', '')))
                
                if location:
                    properties = Property.objects.filter(location__icontains=location[:50])
                    
                    for prop in properties:
                        # Update with enriched data
                        if pd.notna(row.get('safety_score')):
                            prop.hospital_score = float(row.get('hospital_score', prop.hospital_score))
                            prop.school_score = float(row.get('school_score', prop.school_score))
                            prop.save()
                            updated += 1
                            break
                            
            except Exception as e:
                if idx < 5:
                    print(f"  Error on row {idx}: {e}")
        
        print(f"✓ Updated {updated} properties with enriched data")
        return updated
        
    except FileNotFoundError:
        print(f"File not found: {csv_path}")
        return 0
    except Exception as e:
        print(f"Error importing preference enriched data: {e}")
        return 0


def import_match_pref(csv_path):
    """Import match preference data"""
    print(f"\n=== IMPORTING MATCH PREFERENCE DATA FROM {csv_path} ===")
    
    try:
        df = pd.read_csv(csv_path)
        print(f"Found {len(df)} rows in match preference CSV")
        print("✓ Match preference data loaded (can be used for ML model training)")
        return len(df)
        
    except FileNotFoundError:
        print(f"File not found: {csv_path}")
        return 0
    except Exception as e:
        print(f"Error importing match preference data: {e}")
        return 0


if __name__ == '__main__':
    print("=" * 60)
    print("PROPERTY DATA IMPORT SCRIPT")
    print("=" * 60)
    
    # Define CSV paths
    data_dir = os.path.join(os.path.dirname(__file__), '..', 'data')
    
    properties_csv = os.path.join(data_dir, 'properties_clean (1).csv')
    preference_csv = os.path.join(data_dir, 'preference_enriched.csv')
    match_pref_csv = os.path.join(data_dir, 'match_pref_0(1).csv')
    
    # Check if files exist
    print("\nChecking CSV files...")
    for name, path in [('Properties', properties_csv), 
                       ('Preference Enriched', preference_csv),
                       ('Match Preferences', match_pref_csv)]:
        exists = os.path.exists(path)
        print(f"  {name}: {'✓ Found' if exists else '✗ Not found'} - {path}")
    
    # Import main properties
    if os.path.exists(properties_csv):
        imported, skipped = import_properties_clean(properties_csv)
    else:
        print(f"\n✗ Properties CSV not found: {properties_csv}")
        sys.exit(1)
    
    # Import enriched data
    if os.path.exists(preference_csv):
        import_preference_enriched(preference_csv)
    else:
        print(f"\n⚠ Preference enriched CSV not found, skipping...")
    
    # Import match preferences
    if os.path.exists(match_pref_csv):
        import_match_pref(match_pref_csv)
    else:
        print(f"\n⚠ Match preference CSV not found, skipping...")
    
    print("\n" + "=" * 60)
    print("IMPORT COMPLETE!")
    print("=" * 60)
    
    # Final stats
    total_props = Property.objects.count()
    f7_props = Property.objects.filter(location__icontains='F-7').count()
    
    print(f"\nFinal Database Stats:")
    print(f"  Total properties: {total_props:,}")
    print(f"  F-7 properties: {f7_props}")
    print(f"  Locations with most properties:")
    
    from django.db.models import Count
    top_locations = Property.objects.values('location').annotate(
        count=Count('id')
    ).order_by('-count')[:10]
    
    for loc in top_locations:
        location_name = loc['location'][:50]
        print(f"    {location_name}: {loc['count']}")
