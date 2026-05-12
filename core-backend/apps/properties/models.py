"""
Property models matching the CSV data structure
"""
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from django.contrib.auth import get_user_model

User = get_user_model()


class Property(models.Model):
    """
    Property listing model based on properties_clean.csv
    """
    # Basic Information
    link = models.URLField(max_length=500, unique=True, db_index=True)
    price = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        validators=[MinValueValidator(0)]
    )
    location = models.CharField(max_length=255, db_index=True)
    bedrooms = models.IntegerField(validators=[MinValueValidator(0)])
    bathrooms = models.IntegerField(validators=[MinValueValidator(0)])
    area_sqft = models.IntegerField(validators=[MinValueValidator(0)])
    
    # Location Scores (0-1 normalized)
    hospital_score = models.FloatField(
        default=0.0,
        validators=[MinValueValidator(0.0), MaxValueValidator(1.0)]
    )
    school_score = models.FloatField(
        default=0.0,
        validators=[MinValueValidator(0.0), MaxValueValidator(1.0)]
    )
    restaurant_score = models.FloatField(
        default=0.0,
        validators=[MinValueValidator(0.0), MaxValueValidator(1.0)]
    )
    shopping_mall_score = models.FloatField(
        default=0.0,
        validators=[MinValueValidator(0.0), MaxValueValidator(1.0)]
    )
    park_score = models.FloatField(
        default=0.0,
        validators=[MinValueValidator(0.0), MaxValueValidator(1.0)]
    )
    metro_score = models.FloatField(
        default=0.0,
        validators=[MinValueValidator(0.0), MaxValueValidator(1.0)]
    )
    
    # Security/Safety Score
    security_score = models.FloatField(
        default=0.5,
        validators=[MinValueValidator(0.0), MaxValueValidator(1.0)],
        help_text="Security and safety score for the area (0-1)"
    )
    
    # Distance metrics (in km)
    dist_to_hospital = models.FloatField(null=True, blank=True)
    dist_to_school = models.FloatField(null=True, blank=True)
    dist_to_restaurant = models.FloatField(null=True, blank=True)
    dist_to_shopping_mall = models.FloatField(null=True, blank=True)
    dist_to_park = models.FloatField(null=True, blank=True)
    dist_to_metro = models.FloatField(null=True, blank=True)
    
    # Additional features
    description = models.TextField(blank=True)
    title = models.CharField(max_length=255, blank=True)
    property_type = models.CharField(max_length=50, blank=True, db_index=True)
    
    # Status flags
    verified = models.BooleanField(default=False, db_index=True)
    is_active = models.BooleanField(default=True, db_index=True)
    is_featured = models.BooleanField(default=False)
    
    # Images
    main_image = models.URLField(max_length=500, blank=True)
    
    # Society Approval Status (CDA, RDA, PHATA)
    approval_status = models.JSONField(
        default=list,
        blank=True,
        help_text="List of regulatory approvals, e.g. ['CDA', 'RDA', 'PHATA']"
    )
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    updated_at = models.DateTimeField(auto_now=True)
    views_count = models.IntegerField(default=0)
    
    # Owner (optional, for user-submitted properties)
    owner = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='owned_properties'
    )
    
    class Meta:
        db_table = 'properties'
        verbose_name_plural = 'Properties'
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['location', 'price']),
            models.Index(fields=['bedrooms', 'bathrooms']),
            models.Index(fields=['property_type', 'verified']),
            models.Index(fields=['-created_at']),
            models.Index(fields=['is_active', 'verified']),
        ]
    
    def __str__(self):
        return f"{self.title or 'Property'} - {self.location} - PKR {self.price}"
    
    @property
    def price_per_sqft(self):
        """Calculate price per square foot"""
        if self.area_sqft > 0:
            return float(self.price) / self.area_sqft
        return 0
    
    @property
    def average_amenity_score(self):
        """Calculate average of all amenity scores"""
        scores = [
            self.hospital_score,
            self.school_score,
            self.restaurant_score,
            self.shopping_mall_score,
            self.park_score,
            self.metro_score
        ]
        return sum(scores) / len(scores) if scores else 0
    
    def increment_views(self):
        """Increment view count"""
        self.views_count += 1
        self.save(update_fields=['views_count'])


class PropertyImage(models.Model):
    """
    Additional images for properties
    """
    property = models.ForeignKey(
        Property,
        on_delete=models.CASCADE,
        related_name='images'
    )
    image_url = models.URLField(max_length=500)
    caption = models.CharField(max_length=255, blank=True)
    order = models.IntegerField(default=0)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        db_table = 'property_images'
        ordering = ['order', 'uploaded_at']
    
    def __str__(self):
        return f"Image for {self.property.id}"


class PropertyFeature(models.Model):
    """
    Features/amenities of properties
    """
    property = models.ForeignKey(
        Property,
        on_delete=models.CASCADE,
        related_name='features'
    )
    name = models.CharField(max_length=100)
    
    class Meta:
        db_table = 'property_features'
        unique_together = ['property', 'name']
    
    def __str__(self):
        return f"{self.property.id} - {self.name}"



