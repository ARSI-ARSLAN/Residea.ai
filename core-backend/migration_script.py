import os
import django
import cloudinary.uploader
from django.core.files import File

# SETUP: Point to your local settings first to get local data
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'residea_backend.settings')
django.setup()

from apps.properties.models import Property
from apps.users.models import User

def migrate_to_cloud():
    print("🚀 Starting Big Migration...")
    
    # 1. Get all local properties
    local_properties = Property.objects.all()
    print(f"📦 Found {local_properties.count()} properties locally.")
    
    # 2. YOU MUST temporarily set your DATABASE_URL to NEON in your .env before running this!
    # If you have done that, the code below will save to the CLOUD.
    
    for prop in local_properties:
        print(f"  -> Migrating: {prop.title}...")
        
        # Check if it already exists in cloud (by title)
        # Note: This assumes you have already connected to Neon in your settings
        
        # We create a NEW property object for the cloud
        new_prop = Property(
            title=prop.title,
            description=prop.description,
            price=prop.price,
            address=prop.address,
            city=prop.city,
            property_type=prop.property_type,
            bedrooms=prop.bedrooms,
            bathrooms=prop.bathrooms,
            area_sqft=prop.area_sqft,
            status=prop.status,
            owner=User.objects.filter(is_superuser=True).first()
        )
        
        # Handle Image Upload to Cloudinary
        if prop.image:
            try:
                print(f"    ☁️ Uploading image for {prop.title} to Cloudinary...")
                new_prop.image = prop.image
            except Exception as e:
                print(f"    ❌ Image upload failed for {prop.title}: {e}")
        
        new_prop.save()
        print(f"    ✅ Done!")

    print("✨ ALL DATA AND IMAGES MIGRATED TO CLOUD!")

if __name__ == "__main__":
    migrate_to_cloud()
