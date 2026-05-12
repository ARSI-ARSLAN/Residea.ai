# Residea.ai Backend

Django REST API backend for Residea.ai real estate platform with ML-powered property recommendations.

## Features

- 🏠 Property management API
- 🤖 ML-powered property ranking
- 💰 ROI prediction using XGBoost models
- 🔐 JWT authentication
- 👤 User preferences management
- 🔍 Advanced filtering and search
- 📊 RESTful API with Swagger documentation

## Tech Stack

- Django 4.2.7
- Django REST Framework
- PostgreSQL
- XGBoost ML models
- JWT Authentication

## Setup Instructions

### 1. Create Virtual Environment

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Database

Create PostgreSQL database:
```bash
createdb residea_db
```

Update `.env` file with your database credentials.

### 4. Run Migrations

```bash
python manage.py migrate
```

### 5. Load Initial Data

```bash
python manage.py load_properties
python manage.py load_preferences
```

### 6. Create Superuser

```bash
python manage.py createsuperuser
```

### 7. Run Development Server

```bash
python manage.py runserver
```

API will be available at `http://localhost:8000/`

## API Endpoints

### Authentication
- `POST /api/auth/register/` - Register new user
- `POST /api/auth/login/` - Login and get JWT tokens
- `POST /api/auth/token/refresh/` - Refresh access token

### Properties
- `GET /api/properties/` - List properties (with filtering)
- `GET /api/properties/{id}/` - Get property details
- `POST /api/properties/` - Create property (admin only)
- `GET /api/properties/{id}/roi_estimate/` - Get ROI prediction
- `POST /api/properties/recommendations/` - Get personalized recommendations

### User Preferences
- `GET /api/preferences/` - Get user preferences
- `PUT /api/preferences/` - Update user preferences

### User Profile
- `GET /api/users/profile/` - Get current user profile
- `PUT /api/users/profile/` - Update user profile

## API Documentation

Swagger UI: `http://localhost:8000/swagger/`
ReDoc: `http://localhost:8000/redoc/`

## Testing

```bash
python manage.py test
```

## Project Structure

```
backend/
├── residea_backend/      # Main project settings
├── apps/
│   ├── properties/       # Property management
│   ├── users/           # User authentication
│   ├── preferences/     # User preferences
│   └── ml_services/     # ML model integration
├── ml_models/           # Trained XGBoost models
├── scripts/             # Data loading scripts
└── manage.py
```

## Environment Variables

See `.env.example` for required environment variables.

## License

Proprietary - Residea.ai
