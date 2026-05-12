import pandas as pd
import json

# Analyze properties
print("=" * 80)
print("PROPERTIES DATA ANALYSIS")
print("=" * 80)
df_props = pd.read_csv('data/properties_clean (1).csv')
print(f"\nTotal properties: {len(df_props)}")
print(f"\nColumns ({len(df_props.columns)}):")
for col in df_props.columns:
    print(f"  - {col}: {df_props[col].dtype}")

print(f"\nSample property:")
print(json.dumps(df_props.head(1).to_dict('records')[0], indent=2, default=str))

# Analyze preferences
print("\n" + "=" * 80)
print("USER PREFERENCES DATA ANALYSIS")
print("=" * 80)
df_prefs = pd.read_csv('data/preferences_enriched (1).csv')
print(f"\nTotal users: {len(df_prefs)}")
print(f"\nColumns ({len(df_prefs.columns)}):")
for col in df_prefs.columns:
    print(f"  - {col}: {df_prefs[col].dtype}")

print(f"\nSample user preference:")
print(json.dumps(df_prefs.head(1).to_dict('records')[0], indent=2, default=str))

# Analyze matches
print("\n" + "=" * 80)
print("MATCHES DATA ANALYSIS")
print("=" * 80)
df_matches = pd.read_csv('data/matches_pref_0 (1).csv')
print(f"\nTotal matches: {len(df_matches)}")
print(f"\nColumns ({len(df_matches.columns)}):")
for col in df_matches.columns:
    print(f"  - {col}: {df_matches[col].dtype}")

print(f"\nSample match:")
print(json.dumps(df_matches.head(1).to_dict('records')[0], indent=2, default=str))
