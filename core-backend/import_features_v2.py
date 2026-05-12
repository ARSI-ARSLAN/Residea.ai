"""
Improved feature import - match by ID instead of link
"""
import os
import sys
import django
import csv
from pathlib import Path

# Setup Django
current_dir = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, current_dir)
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'residea_backend.settings')
django.setup()

from apps.properties.models import Property, PropertyFeature

def parse_features(features_string):
    """Parse comma-separated features"""
    if not features_string or features_string.strip() == '':
        return []
    
    # Split by comma and clean
    features = [f.strip() for f in features_string.split(',') if f.strip()]
    return features

def import_features_by_index():
    """Import features matching by row index (assuming same order)"""
    csv_path = Path(__file__).parent.parent / 'data' / 'properties_clean (1).csv'
    
    if not csv_path.exists():
        print(f"✗ CSV file not found: {csv_path}")
        return
    
    print(f"Reading CSV: {csv_path}")
    
    # Get all properties ordered by ID
    all_properties = list(Property.objects.all().order_by('id'))
    print(f"Total properties in DB: {len(all_properties)}")
    
    features_imported = 0
    properties_updated = 0
    errors = 0
    
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        
        # Check if Features column exists
        features_col = 'Features' if 'Features' in reader.fieldnames else 'features'
        if features_col not in reader.fieldnames:
            print(f"✗ Features column not found")
            return
        
        print(f"Using column: {features_col}")
        
        for i, row in enumerate(reader):
            try:
                # Match by index
                if i >= len(all_properties):
                    break
                
                prop = all_properties[i]
                
                # Parse features
                features_str = row.get(features_col, '')
                features_list = parse_features(features_str)
                
                if not features_list:
                    continue
                
                # Create PropertyFeature entries
                for feature_name in features_list:
                    if len(feature_name) > 100:
                        continue
                    
                    feature, created = PropertyFeature.objects.get_or_create(
                        property=prop,
                        name=feature_name
                    )
                    
                    if created:
                        features_imported += 1
                
                properties_updated += 1
                
                if (i + 1) % 500 == 0:
                    print(f"Processed {i+1} rows... ({properties_updated} properties updated, {features_imported} features)")
                    
            except Exception as e:
                errors += 1
                if errors < 10:
                    print(f"Error on row {i}: {str(e)}")
    
    print(f"\n{'='*60}")
    print(f"Import Complete!")
    print(f"{'='*60}")
    print(f"Properties updated: {properties_updated}")
    print(f"Features imported: {features_imported}")
    print(f"Errors: {errors}")
    
    # Show sample
    print(f"\nSample property with features:")
    prop_with_features = Property.objects.filter(features__isnull=False).first()
    if prop_with_features:
        print(f"  Property: {prop_with_features.title}")
        print(f"  Features: {', '.join([f.name for f in prop_with_features.features.all()[:5]])}")

if __name__ == '__main__':
    import_features_by_index()
