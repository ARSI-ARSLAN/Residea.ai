"""
User preference models based on preferences_enriched.csv
"""
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.contrib.auth import get_user_model

User = get_user_model()


class UserPreference(models.Model):
    """
    User property preferences model
    """
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name='preferences',
        primary_key=True
    )
    
    # Location
    city = models.CharField(max_length=100, default='islamabad')
    
    # Budget
    min_budget = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=0,
        validators=[MinValueValidator(0)]
    )
    max_budget = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        default=10000000,
        validators=[MinValueValidator(0)]
    )
    
    # Property requirements
    bedrooms = models.IntegerField(default=3, validators=[MinValueValidator(0)])
    bathrooms = models.IntegerField(default=2, validators=[MinValueValidator(0)])
    
    # Legacy fields (keeping for compatibility if needed, or can remove)
    min_bedrooms = models.IntegerField(default=1, validators=[MinValueValidator(0)])
    max_bedrooms = models.IntegerField(default=5, validators=[MinValueValidator(0)])
    min_bathrooms = models.IntegerField(default=1, validators=[MinValueValidator(0)])
    min_area_sqft = models.IntegerField(default=500, validators=[MinValueValidator(0)])
    
    # Property types (stored as JSON array)
    property_types = models.JSONField(default=list, blank=True)
    
    # User profile
    profession = models.CharField(max_length=50, blank=True, default='')
    timeline = models.CharField(max_length=50, blank=True, default='')
    
    # Purpose
    PURPOSE_CHOICES = [
        ('living', 'Living'),
        ('investment', 'Investment'),
        ('rental', 'Rental'),
    ]
    purpose = models.CharField(
        max_length=20,
        choices=PURPOSE_CHOICES,
        default='living'
    )
    
    # Amenity importance scores (0-1)
    hospital_importance = models.FloatField(
        default=0.5,
        validators=[MinValueValidator(0.0), MaxValueValidator(1.0)]
    )
    school_importance = models.FloatField(
        default=0.5,
        validators=[MinValueValidator(0.0), MaxValueValidator(1.0)]
    )
    restaurant_importance = models.FloatField(
        default=0.5,
        validators=[MinValueValidator(0.0), MaxValueValidator(1.0)]
    )
    shopping_importance = models.FloatField(
        default=0.5,
        validators=[MinValueValidator(0.0), MaxValueValidator(1.0)]
    )
    park_importance = models.FloatField(
        default=0.5,
        validators=[MinValueValidator(0.0), MaxValueValidator(1.0)]
    )
    metro_importance = models.FloatField(
        default=0.5,
        validators=[MinValueValidator(0.0), MaxValueValidator(1.0)]
    )
    security_importance = models.FloatField(
        default=0.5,
        validators=[MinValueValidator(0.0), MaxValueValidator(1.0)]
    )
    parking_importance = models.FloatField(
        default=0.5,
        validators=[MinValueValidator(0.0), MaxValueValidator(1.0)]
    )
    
    # Preferred locations (stored as JSON array)
    preferred_locations = models.JSONField(default=list, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'user_preferences'
    
    def __str__(self):
        return f"Preferences for {self.user.email}"
    
    @property
    def budget_range_formatted(self):
        return f"PKR {self.min_budget} - {self.max_budget}"
