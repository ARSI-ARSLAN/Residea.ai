"""
Signals for users app
"""
import csv
import re
import random
import os
import logging

from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model

User = get_user_model()
logger = logging.getLogger(__name__)

# CSV image pool — loaded once on first use
_image_pool = None
_location_index = None

from django.conf import settings as django_settings

# Resolve CSV path relative to the project root (3 levels up from backend/)
_PROJECT_ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(
    os.path.abspath(__file__)
))))
CSV_PATH = os.path.join(_PROJECT_ROOT, '..', '..', '..', 'e.csv')


def _parse_price(price_str):
    if not price_str:
        return None
    price_str = price_str.strip().lower().replace('pkr', '').strip()
    m = re.match(r'([\d.]+)\s*crore', price_str)
    if m:
        return float(m.group(1)) * 10_000_000
    m = re.match(r'([\d.]+)\s*la[ck]h?', price_str)
    if m:
        return float(m.group(1)) * 100_000
    try:
        return float(re.sub(r'[^\d.]', '', price_str))
    except ValueError:
        return None


def _load_image_pool():
    """Load CSV image data into memory (once)."""
    global _image_pool, _location_index

    if _image_pool is not None:
        return

    _image_pool = []
    _location_index = {}

    csv_path = os.path.normpath(CSV_PATH)
    if not os.path.exists(csv_path):
        logger.warning(f'CSV not found at {csv_path}, image assignment disabled')
        return

    try:
        with open(csv_path, 'r', encoding='utf-8') as f:
            reader = csv.DictReader(f)
            for row in reader:
                images = []
                for col in ['image_url_1', 'image_url_2', 'image_url_3']:
                    url = row.get(col, '').strip()
                    if url:
                        images.append(url)
                if not images:
                    continue

                location = row.get('location', '').strip().lower()
                bedrooms_str = row.get('bedrooms', '').strip()
                try:
                    bedrooms = int(bedrooms_str) if bedrooms_str else None
                except ValueError:
                    bedrooms = None

                entry = {
                    'location': location,
                    'bedrooms': bedrooms,
                    'price': _parse_price(row.get('price', '')),
                    'images': images,
                    'main': images[0],
                }
                _image_pool.append(entry)

                if location not in _location_index:
                    _location_index[location] = []
                _location_index[location].append(entry)

        logger.info(f'Loaded {len(_image_pool)} image entries from CSV')
    except Exception as e:
        logger.error(f'Failed to load CSV images: {e}')


def _find_candidates(loc_key, location_index):
    """Find CSV candidates for a location key using 3 strategies."""
    candidates = location_index.get(loc_key, [])
    if candidates:
        return candidates
    for csv_loc, entries in location_index.items():
        if csv_loc in loc_key or loc_key in csv_loc:
            return entries
    if loc_key:
        for part in loc_key.replace(',', ' ').split():
            if len(part) >= 3:
                for csv_loc, entries in location_index.items():
                    if part in csv_loc:
                        return entries
    return []


def assign_images_to_unimaged_properties():
    """Assign unique CSV images to any properties that have no main_image."""
    from apps.properties.models import Property, PropertyImage

    _load_image_pool()
    if not _image_pool:
        return

    unimaged = Property.objects.filter(main_image='') | Property.objects.filter(main_image__isnull=True)
    count = unimaged.count()
    if count == 0:
        return

    logger.info(f'Assigning images to {count} properties without images')

    # Collect already-used main images to avoid duplicates
    used_mains = set(
        Property.objects.exclude(main_image='')
        .exclude(main_image__isnull=True)
        .values_list('main_image', flat=True)
    )

    assigned = 0
    for prop in unimaged:
        loc_key = prop.location.lower().strip() if prop.location else ''
        candidates = _find_candidates(loc_key, _location_index)

        # Score candidates, penalizing already-used images
        scored = []
        for entry in candidates:
            score = 0
            if entry['bedrooms'] is not None and prop.bedrooms:
                score += abs(entry['bedrooms'] - prop.bedrooms) * 1000
            if entry['price'] is not None and prop.price:
                score += abs(float(entry['price']) - float(prop.price)) / 1_000_000
            if entry['main'] in used_mains:
                score += 100000
            scored.append((score, entry))
        scored.sort(key=lambda x: x[0])

        # Pick best unused
        best_entry = None
        for _, entry in scored:
            if entry['main'] not in used_mains:
                best_entry = entry
                break

        # Global fallback — find any unused image
        if not best_entry:
            for entry in _image_pool:
                if entry['main'] not in used_mains:
                    best_entry = entry
                    break

        # Last resort: reuse random
        if not best_entry:
            best_entry = random.choice(_image_pool)

        images = best_entry['images']
        used_mains.add(best_entry['main'])

        prop.main_image = images[0]
        prop.save(update_fields=['main_image'])
        assigned += 1

        existing = set(prop.images.values_list('image_url', flat=True))
        for idx, url in enumerate(images):
            if url not in existing:
                PropertyImage.objects.create(
                    property=prop, image_url=url,
                    caption=f'Photo {idx + 1}', order=idx,
                )

    logger.info(f'Assigned unique images to {assigned} properties')


@receiver(post_save, sender=User)
def create_user_preferences(sender, instance, created, **kwargs):
    """
    Create user preferences when a new user is created
    """
    if created:
        from apps.preferences.models import UserPreference
        UserPreference.objects.create(user=instance)


@receiver(post_save, sender=User)
def assign_property_images_on_signup(sender, instance, created, **kwargs):
    """
    When a new user signs up, ensure all properties have unique images from CSV.
    """
    if created:
        try:
            assign_images_to_unimaged_properties()
        except Exception as e:
            logger.error(f'Image assignment on signup failed: {e}')
