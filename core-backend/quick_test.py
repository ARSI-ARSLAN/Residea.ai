import os, django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'residea_backend.settings')
django.setup()

from apps.properties.models import Property
from apps.preferences.models import UserPreference
from django.contrib.auth import get_user_model

print("\n=== SYSTEM STATUS ===\n")

# 1. Database
total = Property.objects.count()
print(f"1. Database: {total:,} properties")

# 2. Sample locations
print(f"\n2. Sample locations:")
for p in Property.objects.all()[:5]:
    print(f"   - {p.location}")

# 3. F-7 search
f7 = Property.objects.filter(location__icontains='F-7').count()
print(f"\n3. F-7 properties: {f7}")

if f7 > 0:
    print("   Sample F-7:")
    for p in Property.objects.filter(location__icontains='F-7')[:3]:
        print(f"   - {p.location} | PKR {int(p.price):,}")

# 4. User prefs
User = get_user_model()
try:
    user = User.objects.get(email='testbuyer@residea.ai')
    prefs = UserPreference.objects.get(user=user)
    print(f"\n4. Test user: {user.email}")
    print(f"   Preferences: {prefs.preferred_locations}, {prefs.bedrooms} beds")
except:
    print(f"\n4. Test user: NOT FOUND")

# 5. Recommendation test
if f7 > 0:
    try:
        min_p = int(int(prefs.min_budget) * 0.8)
        max_p = int(int(prefs.max_budget) * 1.2)
        matches = Property.objects.filter(
            price__gte=min_p,
            price__lte=max_p,
            bedrooms__gte=prefs.bedrooms-1,
            bedrooms__lte=prefs.bedrooms+1,
            location__icontains='F-7'
        ).count()
        print(f"\n5. F-7 Recommendations: {matches} matches")
    except:
        print(f"\n5. F-7 Recommendations: ERROR")
else:
    print(f"\n5. F-7 Recommendations: No F-7 properties")

print("\n" + "="*40)
