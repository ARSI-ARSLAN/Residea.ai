"""
Django management command to load properties from CSV
Usage: python manage.py load_properties
"""
import pandas as pd
import numpy as np
import logging
from django.core.management.base import BaseCommand
from apps.properties.models import Property

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Load properties from CSV file into database'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--file',
            type=str,
            default='../data/properties_clean (1).csv',
            help='Path to CSV file'
        )
        parser.add_argument(
            '--batch-size',
            type=int,
            default=500,
            help='Batch size for bulk create'
        )
    
    def handle(self, *args, **options):
        file_path = options['file']
        batch_size = options['batch_size']
        
        self.stdout.write(f'Loading properties from {file_path}...')
        
        try:
            # Read CSV
            df = pd.read_csv(file_path)
            self.stdout.write(f'Found {len(df)} properties in CSV')
            
            # Replace NaN with None/0
            df = df.replace({np.nan: None})
            
            # Clear existing properties
            Property.objects.all().delete()
            self.stdout.write('Cleared existing properties')
            
            # Prepare properties for bulk create
            properties = []
            created_count = 0
            error_count = 0
            
            for idx, row in df.iterrows():
                try:
                    # Safely get values with defaults
                    price = row.get('clean_price', 0)
                    if price is None or pd.isna(price):
                        price = 0
                    
                    bedrooms = row.get('bedrooms', 0)
                    if bedrooms is None or pd.isna(bedrooms):
                        bedrooms = 0
                    
                    bathrooms = row.get('bathrooms', 0)
                    if bathrooms is None or pd.isna(bathrooms):
                        bathrooms = 0
                    
                    area = row.get('area', 0)
                    if area is None or pd.isna(area):
                        area = 0
                    
                    location = row.get('location', 'Unknown')
                    if location is None or pd.isna(location):
                        location = 'Unknown'
                    
                    # Create property object
                    property_obj = Property(
                        link=row.get('links', f'http://example.com/property/{idx}'),
                        price=float(price),
                        location=str(location),
                        bedrooms=int(bedrooms),
                        bathrooms=int(bathrooms),
                        area_sqft=int(area),
                        
                        # Location scores - handle NaN
                        hospital_score=float(row.get('hospital_score', 0) or 0),
                        school_score=float(row.get('school_score', 0) or 0),
                        restaurant_score=float(row.get('restaurant_score', 0) or 0),
                        shopping_mall_score=float(row.get('shopping_mall_score', 0) or 0),
                        park_score=float(row.get('park_score', 0) or 0),
                        metro_score=float(row.get('metro_score', 0) or 0),
                        
                        # Distances - can be None
                        dist_to_hospital=row.get('dist_to_hospital'),
                        dist_to_school=row.get('dist_to_school'),
                        dist_to_restaurant=row.get('dist_to_restaurant'),
                        dist_to_shopping_mall=row.get('dist_to_shopping_mall'),
                        dist_to_park=row.get('dist_to_park'),
                        dist_to_metro=row.get('dist_to_metro'),
                        
                        # Additional fields
                        title=f"Property in {location}",
                        verified=True if idx % 3 == 0 else False,
                        is_active=True,
                    )
                    properties.append(property_obj)
                    
                    # Bulk create in batches
                    if len(properties) >= batch_size:
                        Property.objects.bulk_create(properties, ignore_conflicts=False)
                        created_count += len(properties)
                        self.stdout.write(f'Created batch of {len(properties)} properties (Total: {created_count})')
                        properties = []
                        
                except Exception as e:
                    error_count += 1
                    if error_count <= 5:  # Only log first 5 errors
                        logger.error(f'Error processing row {idx}: {str(e)}')
                    continue
            
            # Create remaining properties
            if properties:
                Property.objects.bulk_create(properties, ignore_conflicts=False)
                created_count += len(properties)
                self.stdout.write(f'Created final batch of {len(properties)} properties')
            
            total_count = Property.objects.count()
            self.stdout.write(self.style.SUCCESS(
                f'Successfully loaded {created_count} properties. '
                f'Total in database: {total_count}. '
                f'Errors: {error_count}'
            ))
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error loading properties: {str(e)}'))
            import traceback
            traceback.print_exc()
            raise
