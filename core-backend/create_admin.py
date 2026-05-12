import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'residea_backend.settings')
django.setup()

from apps.users.models import User

def create_admin():
    if not User.objects.filter(username='admin').exists():
        print("Creating admin user...")
        User.objects.create_superuser('admin', 'admin@example.com', 'Admin123!')
        print("Admin user created: admin / Admin123!")
    else:
        print("Admin user already exists.")

if __name__ == "__main__":
    create_admin()
