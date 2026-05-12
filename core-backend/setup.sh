#!/bin/bash
# Setup script for Residea.ai Backend

echo "Setting up Residea.ai Backend..."

# Create virtual environment
echo "Creating virtual environment..."
python -m venv venv

# Activate virtual environment
echo "Activating virtual environment..."
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
echo "Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt

# Copy environment file
if [ ! -f .env ]; then
    echo "Creating .env file from template..."
    cp .env.example .env
    echo "Please update .env with your database credentials"
fi

# Create logs directory
mkdir -p logs

echo "Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env file with your PostgreSQL credentials"
echo "2. Create PostgreSQL database: createdb residea_db"
echo "3. Run migrations: python manage.py migrate"
echo "4. Load data: python manage.py load_properties"
echo "5. Create superuser: python manage.py createsuperuser"
echo "6. Run server: python manage.py runserver"
