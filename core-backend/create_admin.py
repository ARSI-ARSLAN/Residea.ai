import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'residea_backend.settings')
django.setup()

from apps.users.models import User

def create_admin():
    email = 'admin@example.com'
    password = 'Admin123!'
    username = 'admin'
    
    if not User.objects.filter(email=email).exists():
        print(f"🤖 Creating superuser with email: {email}...")
        User.objects.create_superuser(
            username=username,
            email=email,
            password=password,
            first_name='Admin',
            last_name='User'
        )
        print("✅ Superuser created successfully!")
    else:
        print("ℹ️ Superuser already exists.")

if __name__ == "__main__":
    create_admin()
