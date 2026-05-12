"""
Import society approval data from CDA, RDA, PHATA CSV files
and tag matching properties in the database.
"""
import os
import sys
import csv
import re
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'residea_backend.settings')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
django.setup()

from apps.properties.models import Property


def clean_name(name):
    """Normalize a society name for matching."""
    name = re.sub(r'[\r\n]+', ' ', name)
    name = re.sub(r'\s+', ' ', name).strip()
    return name.lower()


def extract_keywords(name):
    """Extract matchable keywords from a society name."""
    clean = clean_name(name)
    keywords = []
    keywords.append(clean)

    stop_words = {
        'co-operative', 'cooperative', 'housing', 'scheme', 'society',
        'employees', 'phase', 'phase-i', 'phase-ii', 'phase-iii',
        'phase-iv', 'phase-v', 'phase-vi', 'phase-vii', 'phase-viii',
        'extension', 'ext', 'revised', 'rev', 'off', 'near',
        'road', 'expressway', 'the', 'of', 'and', 'at', 'in',
        'land', 'sub-division', 'sub', 'division', 'project',
        'i', 'ii', 'iii', 'iv', 'v', 'vi', 'vii', 'viii',
        'sector', 'a', 'b', 'c', 'd', 'e', 'k', 'm',
    }

    words = re.findall(r'[a-z0-9][\w-]*', clean)
    significant = [w for w in words if w not in stop_words and len(w) > 1]

    if len(significant) >= 2:
        keywords.append(' '.join(significant[:3]))
        keywords.append(' '.join(significant[:2]))
    if significant:
        keywords.append(significant[0])

    return keywords


def parse_cda_csv(filepath):
    """Parse CDA Society Approvals CSV and return society names."""
    societies = []
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            reader = csv.reader(f)
            rows = list(reader)
            for row in rows[2:]:
                if row and row[0].strip():
                    name = row[0].strip()
                    remarks = row[3].strip() if len(row) > 3 else ''
                    noc_col = row[2].strip() if len(row) > 2 else ''
                    cancelled = 'cancelled' in remarks.lower() or 'cancelled' in noc_col.lower()
                    if not cancelled:
                        societies.append(name)
    except Exception as e:
        print("  Error reading CDA CSV: %s" % e)
    return societies


def parse_rda_csv(filepath):
    """Parse RDA CSV and return society names."""
    societies = []
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            reader = csv.reader(f)
            rows = list(reader)
            for row in rows[1:]:
                if row and row[0].strip():
                    name = row[0].strip()
                    status = row[2].strip().lower() if len(row) > 2 else ''
                    is_rda = ('approved' in status or 'town planning approved' in status
                              or 'final noc' in status or 'final sanction' in status
                              or 'lop approved' in status)
                    is_other = ('phata' in status or 'tma' in status or 'district council' in status)
                    is_negative = ('not granted' in status or 'illegal' in status)
                    if is_rda and not is_other and not is_negative:
                        societies.append(name)
    except Exception as e:
        print("  Error reading RDA CSV: %s" % e)
    return societies


def parse_phata_csv(filepath):
    """Parse PHATA CSV and return society names."""
    societies = []
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            reader = csv.reader(f)
            rows = list(reader)
            for row in rows[1:]:
                if len(row) >= 6:
                    name = row[1].strip()
                    status = row[5].strip().lower() if len(row) > 5 else ''
                    if name and 'approved' in status:
                        societies.append(name)
    except Exception as e:
        print("  Error reading PHATA CSV: %s" % e)
    return societies


def is_cda_sector(location):
    """Check if location is in a CDA-developed sector of Islamabad.
    CDA sectors follow patterns: G-13, F-7, I-10, E-11, D-12, H-8, etc.
    """
    location_lower = location.lower()
    # Match CDA sector patterns (letter-number like G-13, F-7/1, I-10/2)
    # Sectors: D, E, F, G, H, I in Islamabad
    if re.search(r'\b[d-i]-\d{1,2}\b', location_lower):
        # Make sure it mentions Islamabad (not Rawalpindi sectors)
        if 'islamabad' in location_lower or 'isb' in location_lower:
            return True
        # If no city specified, CDA sectors are always Islamabad
        if 'rawalpindi' not in location_lower and 'lahore' not in location_lower:
            return True
    return False


def match_property(location, society_keywords):
    """Check if a property location matches any society from any authority."""
    location_lower = location.lower()
    matched = []

    # Check CDA sectors first (G-13, F-7, I-10, E-11, etc.)
    if is_cda_sector(location):
        matched.append('CDA')

    for authority, societies in society_keywords.items():
        if authority in matched:
            continue
        for society_name, keywords in societies:
            for kw in keywords:
                if len(kw) >= 4 and kw in location_lower:
                    matched.append(authority)
                    break
            if authority in matched:
                break

    return list(set(matched))


def main():
    base_dir = r'D:\exp'
    cda_path = os.path.join(base_dir, 'cda Society Approvals.csv')
    rda_path = os.path.join(base_dir, 'rda.csv')
    phata_path = os.path.join(base_dir, 'phata.csv')

    print("=" * 60)
    print("RESIDEA.AI -- Society Approval Import Script")
    print("=" * 60)

    print("\n[*] Parsing CSV files...")

    cda_societies = parse_cda_csv(cda_path)
    print("  [OK] CDA: %d approved societies" % len(cda_societies))

    rda_societies = parse_rda_csv(rda_path)
    print("  [OK] RDA: %d approved societies" % len(rda_societies))

    phata_societies = parse_phata_csv(phata_path)
    print("  [OK] PHATA: %d approved societies" % len(phata_societies))

    print("\n[*] Building keyword index...")
    society_keywords = {
        'CDA': [(s, extract_keywords(s)) for s in cda_societies],
        'RDA': [(s, extract_keywords(s)) for s in rda_societies],
        'PHATA': [(s, extract_keywords(s)) for s in phata_societies],
    }

    for authority, items in society_keywords.items():
        print("\n  %s sample matches:" % authority)
        for name, kws in items[:3]:
            print("    %-50s -> keywords: %s" % (name[:50], kws[:3]))

    properties = Property.objects.all()
    total = properties.count()
    print("\n[*] Processing %d properties..." % total)

    updated = 0
    tagged_counts = {'CDA': 0, 'RDA': 0, 'PHATA': 0}

    for prop in properties:
        approvals = match_property(prop.location or '', society_keywords)

        if approvals:
            approvals.sort()
            prop.approval_status = approvals
            prop.save(update_fields=['approval_status'])
            updated += 1
            for a in approvals:
                tagged_counts[a] += 1

            if updated <= 10:
                print("  [+] [%s] %s" % (', '.join(approvals), prop.location[:60]))

    print("\n" + "=" * 60)
    print("[RESULTS]")
    print("  Total properties: %d" % total)
    print("  Properties tagged: %d" % updated)
    print("  CDA tagged: %d" % tagged_counts['CDA'])
    print("  RDA tagged: %d" % tagged_counts['RDA'])
    print("  PHATA tagged: %d" % tagged_counts['PHATA'])
    print("=" * 60)


if __name__ == '__main__':
    main()
