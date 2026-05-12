# Residea.ai - Real Estate Platform

Full-stack real estate platform with ML-powered property recommendations, built with React (Vite) frontend and Django REST API backend.

## 🚀 Quick Start

### Run Everything (Recommended)

```bash
# Install all dependencies and run both frontend and backend
npm run setup
npm run start:all
```

### Run Frontend Only

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will be available at: `http://localhost:5173`

### Run Backend Only

```bash
# Navigate to backend directory
cd backend

# Create virtual environment (first time only)
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies (first time only)
pip install -r requirements.txt

# Run migrations (first time only)
python manage.py migrate

# Start development server
python manage.py runserver
```

Backend API will be available at: `http://localhost:8000`

## 📦 Project Structure

```
Residea.ai_Frontend/
├── src/                    # Frontend React source code
│   ├── components/        # React components
│   ├── pages/            # Page components
│   ├── services/         # API services
│   └── utils/            # Utility functions
├── backend/              # Django backend
│   ├── apps/            # Django apps
│   │   ├── properties/  # Property management
│   │   ├── users/       # User authentication
│   │   ├── preferences/ # User preferences
│   │   └── ml_services/ # ML model integration
│   ├── ml_models/       # Trained XGBoost models
│   └── manage.py        # Django management script
├── package.json         # Frontend dependencies
└── vite.config.ts       # Vite configuration
```

## 🛠️ Available Commands

### Frontend Commands

| Command | Description |
|---------|-------------|
| `npm install` | Install frontend dependencies |
| `npm run dev` | Start frontend development server (port 5173) |
| `npm run build` | Build frontend for production |

### Backend Commands

| Command | Description |
|---------|-------------|
| `cd backend && venv\Scripts\activate` | Activate virtual environment (Windows) |
| `cd backend && source venv/bin/activate` | Activate virtual environment (macOS/Linux) |
| `pip install -r requirements.txt` | Install backend dependencies |
| `python manage.py migrate` | Run database migrations |
| `python manage.py runserver` | Start backend server (port 8000) |
| `python manage.py createsuperuser` | Create admin user |
| `python manage.py test` | Run backend tests |
| `python manage.py load_properties` | Load initial property data |
| `python manage.py load_preferences` | Load initial preferences |

### Full Stack Commands

| Command | Description |
|---------|-------------|
| `npm run start:all` | Start both frontend and backend servers |
| `npm run setup` | Install all dependencies (frontend + backend) |

## 🔧 Initial Setup (First Time)

### 1. Frontend Setup

```bash
# Install Node.js dependencies
npm install
```

### 2. Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create superuser (optional)
python manage.py createsuperuser

# Load initial data (optional)
python manage.py load_properties
python manage.py load_preferences
```

### 3. Environment Variables

Create `.env` file in the backend directory:

```env
DEBUG=True
SECRET_KEY=your-secret-key-here
DATABASE_URL=sqlite:///db.sqlite3
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

## 🌐 API Documentation

Once the backend is running, access API documentation at:

- **Swagger UI**: `http://localhost:8000/swagger/`
- **ReDoc**: `http://localhost:8000/redoc/`

## 🔑 Key API Endpoints

### Authentication
- `POST /api/auth/register/` - Register new user
- `POST /api/auth/login/` - Login and get JWT tokens
- `POST /api/auth/token/refresh/` - Refresh access token

### Properties
- `GET /api/properties/` - List properties (with filtering)
- `GET /api/properties/{id}/` - Get property details
- `GET /api/properties/{id}/roi_estimate/` - Get ROI prediction
- `POST /api/properties/recommendations/` - Get personalized recommendations

### User Preferences
- `GET /api/preferences/` - Get user preferences
- `PUT /api/preferences/` - Update user preferences

## 🧪 Testing

### Frontend Tests
```bash
npm run test
```

### Backend Tests
```bash
cd backend
python manage.py test
```

## 🤖 ML Features

- **Property Recommendations**: ML-powered personalized property suggestions
- **ROI Prediction**: XGBoost models for investment return estimates
- **Smart Filtering**: Advanced property search and filtering

## 📱 Tech Stack

### Frontend
- React 18
- Vite
- Radix UI Components
- Axios for API calls
- Lucide React Icons
- Recharts for data visualization

### Backend
- Django 4.2.7
- Django REST Framework
- PostgreSQL / SQLite
- XGBoost ML models
- JWT Authentication
- Swagger/OpenAPI documentation

## 🐛 Troubleshooting

### Frontend Issues

**Port already in use:**
```bash
# Kill process on port 5173
# Windows:
netstat -ano | findstr :5173
taskkill /PID <PID> /F
# macOS/Linux:
lsof -ti:5173 | xargs kill -9
```

### Backend Issues

**Database errors:**
```bash
# Reset database
cd backend
python manage.py flush
python manage.py migrate
```

**Virtual environment not found:**
```bash
# Recreate virtual environment
cd backend
python -m venv venv
```

## 📄 License

Proprietary - Residea.ai

## 🤝 Support

For issues and questions, please contact the development team.