# product/models.py
from django.db import models
from app.posts.models import PostAbstract
from categories.models import Category
from locations.models import Location
from decimal import Decimal

class Product(PostAbstract):
    categories = models.ManyToManyField(Category, related_name='product_categories')
    additional_info = models.TextField(default='')
    short_description = models.TextField(max_length=500, blank=True)
    price = models.DecimalField(max_digits=10, decimal_places=2, default=Decimal('0.00'))
    location = models.ForeignKey(Location, on_delete=models.CASCADE, default=None)
    stock = models.IntegerField(default=0)
    sku = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.title