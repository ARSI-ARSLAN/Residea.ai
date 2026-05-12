#!/usr/bin/env python
"""Simple property import script - only uses existing model fields"""

import os, sys, django, pandas as pd
from decimal import Decimal

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'residea_backend.settings')
django.setup()

from apps.properties.models import Property

# Read CSV
csv_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'properties_clean (1).csv')
df = pd.read_csv(csv_path)

print(f"Found {len(df)} properties in CSV")
print(f"F-7 properties: {df[df['location'].str.contains('F-7', case=False, na=False)].shape[0]}")

# Clear existing
Property.objects.all().delete()
print("Cleared existing properties")

# Import
imported = 0
for idx, row in df.iterrows():
    try:
        Property.objects.create(
            link=f"https://example.com/property/{idx}",  # Generate unique link
            title=str(row.get('Description', 'Property'))[:255],
            location=str(row.get('clean_location', row.get('location', 'Unknown')))[:255],
            price=Decimal(str(row.get('clean_price', 0))),
            bedrooms=int(row.get('bedrooms', 0)) if pd.notna(row.get('bedrooms')) else 0,
            bathrooms=int(row.get('bathrooms', 0)) if pd.notna(row.get('bathrooms')) else 0,
            area_sqft=int(row.get('clean_area', 0)) if pd.notna(row.get('clean_area')) else 0,
            property_type=str(row.get('property_type', 'house')),
            hospital_score=float(row.get('hospital_score', 0)) if pd.notna(row.get('hospital_score')) else 0.0,
            school_score=float(row.get('school_score', 0)) if pd.notna(row.get('school_score')) else 0.0,
            restaurant_score=float(row.get('restaurant_score', 0)) if pd.notna(row.get('restaurant_score')) else 0.0,
            shopping_mall_score=float(row.get('shopping_mall_score', 0)) if pd.notna(row.get('shopping_mall_score')) else 0.0,
            park_score=float(row.get('park_score', 0)) if pd.notna(row.get('park_score')) else 0.0,
            metro_score=float(row.get('metro_score', 0)) if pd.notna(row.get('metro_score')) else 0.0,
        )
        imported += 1
        if imported % 500 == 0:
            print(f"Imported {imported}...")
    except Exception as e:
        if idx < 5:
            print(f"Error row {idx}: {e}")

print(f"\n✓ Imported {imported} properties")
print(f"F-7 in database: {Property.objects.filter(location__icontains='F-7').count()}")

# Show sample F-7 properties
for p in Property.objects.filter(location__icontains='F-7')[:3]:
    print(f"  {p.title[:40]} | {p.location} | PKR {p.price:,}")
