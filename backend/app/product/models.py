# product/models.py
from django.db import models
from django.utils.timezone import now, timedelta

from app.posts.models import PostAbstract
from categories.models import Category
from locations.models import Location
from entities.models import Entity
from decimal import Decimal

class Product(PostAbstract):
    categories = models.ManyToManyField(Category, related_name='product_categories')
    additional_info = models.TextField(default='')
    short_description = models.TextField(max_length=500, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    sale_price = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'), blank=True, null=True)
    location = models.ForeignKey(Location, on_delete=models.CASCADE, default=None)
    stock_quantity = models.IntegerField(default=0)
    sku = models.CharField(max_length=100, unique=True)
    avg_rating = models.DecimalField(max_digits=3, decimal_places=2, default=Decimal('0.00'))
    review_count = models.IntegerField(default=0)
    featured_reason = models.CharField(max_length=50, null=True, blank=True)  # Optional: to show why it was featured
    
    # Entity relationships for brand and model
    brand = models.ForeignKey(
        Entity, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='brand_products',
        limit_choices_to={'type': 'brand'},
        help_text="Product brand"
    )
    model = models.ForeignKey(
        Entity, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='model_products',
        limit_choices_to={'type': 'model'},
        help_text="Product model"
    )
    
    @property
    def brand_name(self):
        return self.brand.name if self.brand else None
    
    @property
    def model_name(self):
        return self.model.name if self.model else None
    
    @property
    def full_model_name(self):
        """Returns brand + model, e.g., 'Toyota Corolla'"""
        if self.brand and self.model:
            return f"{self.brand.name} {self.model.name}"
        elif self.model:
            return self.model.name
        elif self.brand:
            return self.brand.name
        return None



    def __str__(self):
        return self.title
    
    def is_new_arrival(self):
        return self.created_at >= now() - timedelta(days=14)

    def is_highly_rated(self):
        return self.avg_rating >= 4.5 and self.review_count >= 5

    def is_on_sale(self):
        return self.sale_price is not None

    def auto_featured(self):
        if self.is_featured:
            return True
        return self.is_new_arrival() or self.is_highly_rated() or self.is_on_sale()

    def get_featured_reason(self):
        if self.is_featured:
            return "manual"
        if self.is_on_sale():
            return "flash_sale"
        if self.is_highly_rated():
            return "high_rating"
        if self.is_new_arrival():
            return "new_arrival"
        return None