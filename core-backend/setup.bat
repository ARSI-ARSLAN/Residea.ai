@echo off
REM Setup script for Residea.ai Backend (Windows)

echo Setting up Residea.ai Backend...

REM Create virtual environment
echo Creating virtual environment...
python -m venv venv

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate.bat

REM Install dependencies
echo Installing dependencies...
python -m pip install --upgrade pip
pip install -r requirements.txt

REM Copy environment file
if not exist .env (
    echo Creating .env file from template...
    copy .env.example .env
    echo Please update .env with your database credentials
)

REM Create logs directory
if not exist logs mkdir logs

echo Setup complete!
echo.
echo Next steps:
echo 1. Update .env file with your PostgreSQL credentials
echo 2. Create PostgreSQL database: createdb residea_db
echo 3. Run migrations: python manage.py migrate
echo 4. Load data: python manage.py load_properties
echo 5. Create superuser: python manage.py createsuperuser
echo 6. Run server: python manage.py runserver

pause
