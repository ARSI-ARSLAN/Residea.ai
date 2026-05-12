import os
import django
from decimal import Decimal

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'residea_backend.settings')
django.setup()

from apps.properties.models import Property
from apps.users.models import User

def seed_properties():
    # Ensure admin exists
    admin_user = User.objects.filter(is_superuser=True).first()
    if not admin_user:
        print("Creating admin user first...")
        admin_user = User.objects.create_superuser('admin', 'admin@example.com', 'Admin123!')

    # Demo Properties
    properties = [
        {
            'title': 'Modern Luxury Villa',
            'description': 'Stunning 4-bedroom villa with smart home features and a private pool.',
            'price': 1250000,
            'address': '123 Elite Enclave, DHA Phase 6',
            'city': 'Lahore',
            'property_type': 'house',
            'bedrooms': 4,
            'bathrooms': 5,
            'area_sqft': 4500,
            'status': 'for_sale'
        },
        {
            'title': 'Downtown Penthouse',
            'description': 'Panoramic city views, floor-to-ceiling windows, and luxury finishes.',
            'price': 850000,
            'address': 'Sky Tower, Clifton Block 4',
            'city': 'Karachi',
            'property_type': 'apartment',
            'bedrooms': 3,
            'bathrooms': 3,
            'area_sqft': 2800,
            'status': 'for_sale'
        },
        {
            'title': 'Cozy Suburban Cottage',
            'description': 'Perfect for families, near top-rated schools and parks.',
            'price': 450000,
            'address': '45 Garden Road, Bahria Town',
            'city': 'Islamabad',
            'property_type': 'house',
            'bedrooms': 3,
            'bathrooms': 2,
            'area_sqft': 1800,
            'status': 'for_sale'
        }
    ]

    for p_data in properties:
        if not Property.objects.filter(title=p_data['title']).exists():
            print(f"Creating property: {p_data['title']}...")
            Property.objects.create(
                owner=admin_user,
                **p_data
            )
    print("✅ Demo properties seeded successfully!")

if __name__ == "__main__":
    seed_properties()
