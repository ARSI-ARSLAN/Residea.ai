"""
Add missing fields for property details page
"""
from django.db import migrations, models

class Migration(migrations.Migration):

    dependencies = [
        ('properties', '0003_property_security_score'),
    ]

    operations = [
        migrations.AddField(
            model_name='property',
            name='weather_risk',
            field=models.CharField(max_length=20, default='Moderate', choices=[
                ('Low', 'Low'),
                ('Moderate', 'Moderate'),
                ('High', 'High')
            ]),
        ),
        migrations.AddField(
            model_name='property',
            name='legal_compliance',
            field=models.BooleanField(default=True, help_text='Property has all legal approvals'),
        ),
        migrations.AddField(
            model_name='property',
            name='market_appreciation_rate',
            field=models.FloatField(default=0.10, help_text='Annual appreciation rate (0.10 = 10%)'),
        ),
        migrations.AddField(
            model_name='property',
            name='demand_level',
            field=models.CharField(max_length=20, default='Medium', choices=[
                ('Low', 'Low'),
                ('Medium', 'Medium'),
                ('High', 'High')
            ]),
        ),
    ]
