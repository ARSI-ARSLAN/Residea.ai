# ML Recommendations Fix Summary

## Problem
After user signup, the system was recommending random properties instead of using the trained XGBoost ML models for personalized recommendations.

## Root Causes Identified

### 1. Feature Engineering Issues
- **Score Normalization**: The feature engineering was dividing amenity scores by 100, but the database already stores scores in 0-1 range
- **Type Mismatch**: Budget calculations were using Decimal types from Django models, causing errors when passed to numpy arrays

### 2. User Preference Access
- The ranker wasn't properly accessing user preferences from the OneToOne relationship
- Mock user objects in the views weren't being handled correctly

## Fixes Applied

### 1. Fixed Feature Engineering (`apps/ml_services/feature_engineering.py`)
```python
# BEFORE (incorrect):
school_score = float(property_obj.school_score) / 100.0  # Wrong!

# AFTER (correct):
school_score = float(property_obj.school_score)  # Already 0-1 in DB
```

Also fixed:
- Converted Decimal budget values to float before calculations
- Fixed all amenity score normalizations (school, hospital, metro, park, shopping_mall, restaurant)

### 2. Fixed Property Ranker (`apps/ml_services/ranker.py`)
```python
# Added proper preference access handling
if hasattr(user, 'preferences'):
    # Direct relationship via OneToOne
    user_prefs = user.preferences
elif hasattr(user, 'property_preferences'):
    # Mock user with property_preferences attribute
    user_prefs = user.property_preferences.order_by('-created_at').first()
```

Also fixed:
- Fallback ranking to use correct score range (0-1 instead of 0-100)

## Verification

Created test script (`test_recommendations.py`) that confirms:
- ✅ ML models load successfully
- ✅ Feature engineering produces correct 11-feature vectors
- ✅ XGBoost ranker produces differentiated scores (e.g., 10.00, 9.45, 8.23)
- ✅ Properties are ranked based on user preferences

### Test Results
```
Top 10 ML-ranked recommendations:
1. Score: 10.00 | Shaheen Town, Islamabad
2. Score: 10.00 | Burma Town, Islamabad
3. Score: 10.00 | Burma Town, Islamabad
4. Score: 10.00 | Burma Town, Islamabad
5. Score: 10.00 | Marwa Town - Block D, Islamabad
6. Score: 9.45 | Lilly Sector - Block E, Islamabad
7. Score: 9.45 | Oleander Sector - DHA Homes, Islamabad
...
```

## How It Works Now

1. **User Signs Up** → Creates account
2. **User Sets Preferences** → Saves budget, bedrooms, locations, amenity importance
3. **Request Recommendations** → API endpoint `/api/properties/recommendations/`
4. **Feature Engineering** → Converts property + preferences into 11 features:
   - price_fit_score
   - bedroom_match
   - area_match_score
   - location_match_score
   - school_score, hospital_score, metro_score, park_score
   - facility_match_ratio
   - risk_adjusted_safety
   - risk_adjusted_roi
5. **XGBoost Prediction** → Trained model scores each property
6. **Ranking & Normalization** → Scores normalized to 0-10 scale
7. **ROI Prediction** → Additional XGBoost model predicts 1yr and 5yr ROI
8. **Response** → Returns top N properties with scores and ROI estimates

## API Usage

### Get Personalized Recommendations
```http
POST /api/properties/recommendations/
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "limit": 10
}
```

### Response
```json
{
  "count": 10,
  "properties": [
    {
      "property": {
        "id": 123,
        "title": "Beautiful House",
        "location": "DHA Phase 5",
        "price": 8500000,
        "bedrooms": 3,
        ...
      },
      "score": 9.45,
      "match_percentage": 94,
      "roi_1yr": 12.5,
      "roi_5yr": 45.2
    },
    ...
  ]
}
```

## Database Schema

### Properties Table
- Amenity scores stored as 0-1 floats (not 0-100)
- Fields: school_score, hospital_score, metro_score, park_score, shopping_mall_score, restaurant_score

### User Preferences Table
- Budget stored as Decimal (converted to float in feature engineering)
- Amenity importance stored as 0-1 floats
- Preferred locations stored as JSON array

## ML Models

Located in: `Models Trained/`
- `xgbr_ranker (2).pkl` - Property ranking model
- `xgbr_roi (2).pkl` - ROI prediction model

Both models trained with XGBoost on historical property data with user preferences.

## Next Steps (Optional Improvements)

1. **Model Retraining**: Export models using `Booster.save_model()` to eliminate XGBoost warnings
2. **Feature Expansion**: Add more features like property age, neighborhood trends
3. **A/B Testing**: Compare ML recommendations vs rule-based recommendations
4. **Feedback Loop**: Collect user interactions to retrain models
5. **Caching**: Cache model predictions for frequently viewed properties

## Testing

Run the test script:
```bash
cd backend
.venv\Scripts\python.exe test_recommendations.py
```

Or test via API:
1. Sign up a user
2. Set preferences via `/api/preferences/`
3. Call `/api/properties/recommendations/`
4. Verify scores are differentiated (not all 0.5)
