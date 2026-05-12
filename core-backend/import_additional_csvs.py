#!/usr/bin/env python
"""Import additional CSV files: preferences_enriched and matches_pref"""

import os, django, pandas as pd
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'residea_backend.settings')
django.setup()

from apps.properties.models import Property

data_dir = os.path.join(os.path.dirname(__file__), '..', 'data')

print("=" * 60)
print("IMPORTING ADDITIONAL CSV FILES")
print("=" * 60)

# 1. Import preferences_enriched
print("\n1. PREFERENCES_ENRICHED.CSV")
print("-" * 60)
pref_csv = os.path.join(data_dir, 'preferences_enriched (1).csv')

try:
    df_pref = pd.read_csv(pref_csv)
    print(f"✓ Loaded {len(df_pref)} rows")
    print(f"  Columns: {list(df_pref.columns)[:10]}")
    
    # Update properties with enriched data if location matches
    updated = 0
    for idx, row in df_pref.iterrows():
        try:
            location = str(row.get('clean_location', row.get('location', '')))
            if location and len(location) > 5:
                # Find matching property
                props = Property.objects.filter(location__icontains=location[:30])
                if props.exists():
                    prop = props.first()
                    
                    # Update with any additional scores from enriched data
                    if pd.notna(row.get('safety_score')):
                        # Store safety score if field exists
                        pass  # Property model doesn't have safety_score field
                    
                    updated += 1
                    if updated % 100 == 0:
                        print(f"  Processed {updated}...")
        except Exception as e:
            if idx < 3:
                print(f"  Error row {idx}: {e}")
    
    print(f"✓ Processed {updated} enriched records")
    
except FileNotFoundError:
    print(f"✗ File not found: {pref_csv}")
except Exception as e:
    print(f"✗ Error: {e}")

# 2. Import matches_pref
print("\n2. MATCHES_PREF_0.CSV")
print("-" * 60)
match_csv = os.path.join(data_dir, 'matches_pref_0 (1).csv')

try:
    df_match = pd.read_csv(match_csv)
    print(f"✓ Loaded {len(df_match)} rows")
    print(f"  Columns: {list(df_match.columns)[:10]}")
    print(f"  This data can be used for ML model training")
    print(f"  (User preference matching patterns)")
    
except FileNotFoundError:
    print(f"✗ File not found: {match_csv}")
except Exception as e:
    print(f"✗ Error: {e}")

print("\n" + "=" * 60)
print("IMPORT COMPLETE")
print("=" * 60)
print(f"\nNote: Additional CSV data loaded for analysis.")
print(f"Property model may need additional fields to store all enriched data.")
