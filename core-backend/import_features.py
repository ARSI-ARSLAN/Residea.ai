"""
Import property features from CSV to database
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
    """Parse comma-separated or pipe-separated features"""
    if not features_string or features_string.strip() == '':
        return []
    
    # Try comma separation first
    if ',' in features_string:
        return [f.strip() for f in features_string.split(',') if f.strip()]
    # Try pipe separation
    elif '|' in features_string:
        return [f.strip() for f in features_string.split('|') if f.strip()]
    # Single feature
    else:
        return [features_string.strip()]

def import_features_from_csv():
    """Import features from CSV to PropertyFeature model"""
    csv_path = Path(__file__).parent.parent / 'data' / 'properties_clean (1).csv'
    
    if not csv_path.exists():
        print(f"✗ CSV file not found: {csv_path}")
        return
    
    print(f"Reading CSV: {csv_path}")
    
    features_imported = 0
    properties_updated = 0
    errors = 0
    
    with open(csv_path, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        
        # Check if Features column exists (capital F)
        if 'Features' not in reader.fieldnames and 'features' not in reader.fieldnames:
            print("✗ 'Features' column not found in CSV")
            print(f"Available columns: {', '.join(reader.fieldnames)}")
            return
        
        features_col = 'Features' if 'Features' in reader.fieldnames else 'features'
        
        for i, row in enumerate(reader, 1):
            try:
                # Find property by link
                link = row.get('links', '').strip()
                if not link:
                    continue
                
                try:
                    prop = Property.objects.get(link=link)
                except Property.DoesNotExist:
                    continue
                
                # Parse features
                features_str = row.get(features_col, '')
                features_list = parse_features(features_str)
                
                if not features_list:
                    continue
                
                # Create PropertyFeature entries
                for feature_name in features_list:
                    if len(feature_name) > 100:  # Skip if too long
                        continue
                    
                    feature, created = PropertyFeature.objects.get_or_create(
                        property=prop,
                        name=feature_name
                    )
                    
                    if created:
                        features_imported += 1
                
                properties_updated += 1
                
                if i % 100 == 0:
                    print(f"Processed {i} rows... ({properties_updated} properties updated, {features_imported} features imported)")
                    
            except Exception as e:
                errors += 1
                if errors < 10:  # Only print first 10 errors
                    print(f"Error on row {i}: {str(e)}")
    
    print(f"\n{'='*60}")
    print(f"Import Complete!")
    print(f"{'='*60}")
    print(f"Properties updated: {properties_updated}")
    print(f"Features imported: {features_imported}")
    print(f"Errors: {errors}")

if __name__ == '__main__':
    import_features_from_csv()
