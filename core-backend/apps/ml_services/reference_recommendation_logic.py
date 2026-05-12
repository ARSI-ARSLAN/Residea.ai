"""
Reference: Original ML Recommendation Script
This shows the exact feature engineering used to train the models
"""
import pandas as pd
import numpy as np
import joblib
import os
import math

# -----------------------------
# Paths to files
# -----------------------------
DATA_DIR = "/kaggle/working/"           
MODEL_DIR = "/kaggle/working/models_artifacts"

properties_file = os.path.join(DATA_DIR, "properties_clean.csv")
ranker_model_file = os.path.join(MODEL_DIR, "xgbr_ranker.pkl")
roi_model_file = os.path.join(MODEL_DIR, "xgbr_roi.pkl")

# -----------------------------
# Load CSVs and models
# -----------------------------
properties = pd.read_csv(properties_file)
ranker_model = joblib.load(ranker_model_file)
roi_model = joblib.load(roi_model_file)

print("Models and property data loaded successfully.\n")

# -----------------------------
# Interactive user input
# -----------------------------
print("Please enter your property preferences:\n")
budget_min = float(input("Minimum budget : "))
budget_max = float(input("Maximum budget : "))
preferred_location = input("Preferred location : ")
preferred_bedrooms = int(input("Number of bedrooms: "))
preferred_type = input("Property type (flat/house/plot): ")
nearby_facilities = input("Nearby facilities (comma-separated, e.g., school,hospital,metro,park): ").split(",")

user_pref = {
    "budget_min": budget_min,
    "budget_max": budget_max,
    "preferred_location": preferred_location.strip().lower(),
    "preferred_bedrooms": preferred_bedrooms,
    "preferred_type": preferred_type.strip().lower(),
    "nearby_facilities": [f.strip().lower() for f in nearby_facilities]
}

# -----------------------------
# Filter properties by location keyword
# -----------------------------
matches = properties[
    properties["clean_location"].str.lower().str.contains(user_pref["preferred_location"])
].copy()

if matches.empty:
    print(f"⚠ No properties found in '{user_pref['preferred_location']}'. Showing nearby sectors.")
    matches = properties[
        properties["clean_location"].str.lower().str.contains(user_pref["preferred_location"].split('-')[0])
    ].copy()

if matches.empty:
    print("⚠ No properties found at all for this location. Exiting.")
    exit()

# -----------------------------
# Filter by budget, bedrooms, type
# -----------------------------
matches = matches[
    (matches["clean_price"] >= user_pref["budget_min"]) &
    (matches["clean_price"] <= user_pref["budget_max"]) &
    (matches["bedrooms"] >= user_pref["preferred_bedrooms"])
]

if "type" in matches.columns:
    matches = matches[matches["type"].str.lower() == user_pref["preferred_type"]]

if matches.empty:
    print("⚠ No properties match your budget/bedrooms/type exactly. Showing closest matches.")
    matches = properties[
        properties["clean_location"].str.lower().str.contains(user_pref["preferred_location"])
    ].copy()

print(f"✔ Found {len(matches)} properties after applying filters.")

# -----------------------------
# Helper functions
# -----------------------------
def price_fit_score(clean_price, budget_center, budget_range):
    if budget_range <= 0 or math.isnan(clean_price) or math.isnan(budget_center):
        return 0.0
    score = 1 - abs(clean_price - budget_center) / (budget_range / 2)
    return float(np.clip(score, 0, 1))

# -----------------------------
# Compute match features
# -----------------------------
budget_center = (user_pref["budget_min"] + user_pref["budget_max"]) / 2
budget_range = user_pref["budget_max"] - user_pref["budget_min"]

matches["area_match_score"] = 0.0  # user doesn't provide area
matches["price_fit_score"] = matches["clean_price"].apply(lambda x: price_fit_score(x, budget_center, budget_range))
matches["bedroom_match"] = (matches["bedrooms"] >= user_pref["preferred_bedrooms"]).astype(int)
matches["location_exact_match"] = (matches["clean_location"].str.lower() == user_pref["preferred_location"]).astype(int)
matches["location_match_score"] = matches["location_exact_match"].astype(float)

# Facility match
facility_columns = ["school_score", "hospital_score", "metro_score", "park_score"]
for f in facility_columns:
    if f not in matches.columns:
        matches[f] = 0.0

matches["facility_match_ratio"] = 0
for f in user_pref["nearby_facilities"]:
    col = f"{f}_score"
    if col in matches.columns:
        matches["facility_match_ratio"] += (matches[col] > 0).astype(int)
matches["facility_match_ratio"] = matches["facility_match_ratio"] / max(len(user_pref["nearby_facilities"]), 1)

# Risk-adjusted safety & ROI fallback
if "risk_adjusted_safety" not in matches.columns:
    matches["risk_adjusted_safety"] = 1.0
if "risk_adjusted_roi" not in matches.columns:
    matches["risk_adjusted_roi"] = matches["clean_price"] / matches["clean_price"].median()

# -----------------------------
# Predict rank score & ROI
# -----------------------------
rank_features = [
    "price_fit_score", "bedroom_match", "area_match_score", "location_match_score",
    "school_score", "hospital_score", "metro_score", "park_score",
    "facility_match_ratio", "risk_adjusted_safety", "risk_adjusted_roi"
]

roi_features = [
    "price_fit_score", "bedroom_match", "area_match_score", "location_match_score",
    "school_score", "hospital_score", "metro_score", "park_score",
    "facility_match_ratio", "risk_adjusted_safety"
]

X_rank = matches[rank_features]
X_roi = matches[roi_features]

matches["rank_score"] = ranker_model.predict(X_rank)
matches["roi_predicted"] = roi_model.predict(X_roi)

# Convert ROI → Percentage
matches["roi_percent"] = (matches["roi_predicted"] * 100).round(1).astype(str) + "%"

# Normalize rank score to 0–10
min_score = matches["rank_score"].min()
max_score = matches["rank_score"].max()
if max_score - min_score == 0:
    matches["rank_score_normalized"] = 5.0
else:
    matches["rank_score_normalized"] = 10 * (matches["rank_score"] - min_score) / (max_score - min_score)

# -----------------------------
# Show top recommendations
# -----------------------------
top_n = 10
matches_sorted = matches.sort_values(by="rank_score_normalized", ascending=False).reset_index(drop=True)

print(f"\nTop {min(top_n, len(matches_sorted))} property recommendations:\n")
print(matches_sorted[[
    "links", "clean_location", "clean_price", "bedrooms",
    "rank_score_normalized", "roi_percent"
]].head(top_n))
