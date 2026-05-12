# Quick Start Guide - Residea.ai Backend

## ✅ Backend is Now Running!

The Django backend is successfully running at: **http://localhost:8000/**

## 🎯 What Was Done

1. ✅ Installed all Python dependencies (Django, DRF, JWT, ML libraries)
2. ✅ Configured SQLite database (no PostgreSQL setup needed)
3. ✅ Created all database migrations
4. ✅ Ran migrations - all tables created
5. ✅ Loaded ML models (XGBoost ranker & ROI predictor)
6. ✅ Started development server on port 8000

## 🔗 Available Endpoints

### API Documentation
- **Swagger UI**: http://localhost:8000/swagger/
- **ReDoc**: http://localhost:8000/redoc/

### Health Check
- **ML Models Status**: http://localhost:8000/api/ml/health/

### Authentication
- Register: `POST /api/auth/register/`
- Login: `POST /api/auth/login/`
- Refresh Token: `POST /api/auth/token/refresh/`

### Properties
- List Properties: `GET /api/properties/`
- Property Details: `GET /api/properties/{id}/`
- ROI Estimate: `GET /api/properties/{id}/roi_estimate/`
- Recommendations: `POST /api/properties/recommendations/`

## 📝 Next Steps

### 1. Create a Superuser (Admin Access)
```bash
cd backend
venv\Scripts\python.exe manage.py createsuperuser
```

### 2. Load Property Data
```bash
venv\Scripts\python.exe manage.py load_properties
```

### 3. Access Admin Panel
Visit: http://localhost:8000/admin/

### 4. Test the API
Use the Swagger UI at http://localhost:8000/swagger/ to test endpoints

## 🧪 Quick API Test

### Register a User
```bash
curl -X POST http://localhost:8000/api/auth/register/ ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"test@example.com\",\"username\":\"testuser\",\"password\":\"SecurePass123!\",\"password2\":\"SecurePass123!\",\"first_name\":\"Test\",\"last_name\":\"User\",\"user_type\":\"buyer\"}"
```

### Login
```bash
curl -X POST http://localhost:8000/api/auth/login/ ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"test@example.com\",\"password\":\"SecurePass123!\"}"
```

## 🛑 Stop the Server
Press `Ctrl+C` in the terminal where the server is running

## 🔄 Restart the Server
```bash
cd backend
venv\Scripts\python.exe manage.py runserver
```

## 📊 Database
- **Type**: SQLite (db.sqlite3)
- **Location**: `backend/db.sqlite3`
- **To switch to PostgreSQL**: Set `USE_SQLITE=False` in `.env` and configure PostgreSQL credentials

## 🤖 ML Models
- **Ranker Model**: Loaded ✅
- **ROI Predictor**: Loaded ✅
- **Location**: `Models Trained/` directory
- **Status Check**: http://localhost:8000/api/ml/health/

## ⚙️ Configuration
All settings in `backend/.env`:
- `DEBUG=True` - Development mode
- `USE_SQLITE=True` - Using SQLite database
- `CORS_ALLOWED_ORIGINS` - Frontend URLs allowed

## 🎉 Success!
Your Django backend is fully operational and ready for frontend integration!
