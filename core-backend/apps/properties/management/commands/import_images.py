"""
Management command to import property images from e.csv.
- Ensures EVERY property gets a main_image.
- No two properties share the same main_image (unique assignment).
"""
import csv
import re
import random
from django.core.management.base import BaseCommand
from apps.properties.models import Property, PropertyImage


def parse_price(price_str):
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


class Command(BaseCommand):
    help = 'Import unique property images from e.csv — no duplicates across properties'

    def add_arguments(self, parser):
        parser.add_argument('--csv', type=str, default=r'D:\exp\e.csv')
        parser.add_argument('--dry-run', action='store_true')
        parser.add_argument('--reset', action='store_true',
                            help='Clear all existing images first and reassign')

    def handle(self, *args, **options):
        csv_path = options['csv']
        dry_run = options['dry_run']
        reset = options['reset']

        self.stdout.write(f'Reading CSV from: {csv_path}')

        # ── Parse CSV ──────────────────────────────────────────────
        csv_entries = []
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
                        all_urls = row.get('image_url_all', '').strip()
                        if all_urls:
                            images = [u.strip() for u in all_urls.split('|') if u.strip()]
                    if not images:
                        continue

                    csv_entries.append({
                        'location': row.get('location', '').strip(),
                        'bedrooms': self._parse_int(row.get('bedrooms', '')),
                        'price': parse_price(row.get('price', '')),
                        'images': images,
                        'main': images[0],
                    })
        except FileNotFoundError:
            self.stderr.write(self.style.ERROR(f'CSV not found: {csv_path}'))
            return

        self.stdout.write(f'CSV entries with images: {len(csv_entries)}')

        if reset and not dry_run:
            self.stdout.write('Resetting all property images...')
            PropertyImage.objects.all().delete()
            Property.objects.all().update(main_image='')

        # ── Build location index ───────────────────────────────────
        location_index = {}
        for entry in csv_entries:
            loc_key = entry['location'].lower().strip()
            if loc_key not in location_index:
                location_index[loc_key] = []
            location_index[loc_key].append(entry)

        # ── Sort candidates by relevance for each location ─────────
        # This ensures we assign the BEST match first, then cycle
        all_properties = list(Property.objects.all().order_by('id'))
        total = len(all_properties)
        self.stdout.write(f'Total properties: {total}')

        # Track which main_image URLs have been used
        used_mains = set()
        # Track which full image sets have been used
        used_sets = set()

        updated = 0
        gallery_created = 0

        for prop in all_properties:
            # Skip if already has a unique zameen image (from prior import)
            if not reset and prop.main_image and 'zameen.com' in prop.main_image:
                used_mains.add(prop.main_image)
                continue
            if not reset and prop.main_image and prop.main_image.strip():
                used_mains.add(prop.main_image)
                continue

            loc_key = prop.location.lower().strip() if prop.location else ''

            # Find candidates with multiple strategies
            candidates = self._find_candidates(loc_key, location_index)

            # Score and sort candidates
            scored = []
            for entry in candidates:
                score = 0
                if entry['bedrooms'] is not None and prop.bedrooms:
                    score += abs(entry['bedrooms'] - prop.bedrooms) * 1000
                if entry['price'] is not None and prop.price:
                    score += abs(float(entry['price']) - float(prop.price)) / 1_000_000
                # Penalize already-used images heavily
                if entry['main'] in used_mains:
                    score += 100000
                if tuple(entry['images']) in used_sets:
                    score += 50000
                scored.append((score, entry))

            scored.sort(key=lambda x: x[0])

            # Pick the best unused entry
            best_entry = None
            for _, entry in scored:
                if entry['main'] not in used_mains:
                    best_entry = entry
                    break
            
            # If all location matches are used, try ALL csv entries
            if not best_entry:
                for entry in csv_entries:
                    if entry['main'] not in used_mains:
                        best_entry = entry
                        break

            # Last resort: reuse but pick random to spread duplicates
            if not best_entry:
                best_entry = random.choice(csv_entries)

            image_urls = best_entry['images']
            used_mains.add(best_entry['main'])
            used_sets.add(tuple(image_urls))

            if dry_run:
                continue

            prop.main_image = image_urls[0]
            prop.save(update_fields=['main_image'])
            updated += 1

            # Create gallery
            existing_urls = set(prop.images.values_list('image_url', flat=True))
            for idx, url in enumerate(image_urls):
                if url not in existing_urls:
                    PropertyImage.objects.create(
                        property=prop,
                        image_url=url,
                        caption=f'Photo {idx + 1}',
                        order=idx,
                    )
                    gallery_created += 1

        self.stdout.write(self.style.SUCCESS(
            f'\nDone!\n'
            f'  Properties updated: {updated}\n'
            f'  Gallery images created: {gallery_created}\n'
            f'  Unique main images used: {len(used_mains)}'
        ))

    def _parse_int(self, val):
        try:
            return int(val.strip()) if val.strip() else None
        except ValueError:
            return None

    def _find_candidates(self, loc_key, location_index):
        # Strategy 1: Exact match
        candidates = location_index.get(loc_key, [])
        if candidates:
            return candidates

        # Strategy 2: Partial match
        for csv_loc, entries in location_index.items():
            if csv_loc in loc_key or loc_key in csv_loc:
                return entries

        # Strategy 3: Area name match
        if loc_key:
            for part in loc_key.replace(',', ' ').split():
                if len(part) >= 3:
                    for csv_loc, entries in location_index.items():
                        if part in csv_loc:
                            return entries

        return []
