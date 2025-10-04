#!/usr/bin/env python
"""
Test script for the related products endpoint
"""
import os
import sys
import django

# Add the project root to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Configure Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'system.settings')
django.setup()

from app.product.models import Product
from entities.models import Entity
from categories.models import Category

def test_related_products_logic():
    """Test the related products logic"""
    
    print("=== Testing Related Products Logic ===\n")
    
    # Get some sample data
    products = Product.objects.filter(status='published').order_by('-created_at')
    print(f"Found {products.count()} published products")
    
    if not products.exists():
        print("No published products found. Please create some products first.")
        return
    
    # Test with the first product
    test_product = products.first()
    if not test_product:
        print("No products available for testing")
        return
        
    print(f"\nTesting with product: {test_product.title}")
    print(f"Product slug: {test_product.slug}")
    print(f"Brand: {test_product.brand}")
    print(f"Model: {test_product.model}")
    print(f"Categories: {[c.name for c in test_product.categories.all()]}")
    
    # Test the endpoint URL
    print(f"\nTest URL: /api/products/related-products/{test_product.slug}/")
    
    # Get brands and models
    brands = Entity.objects.filter(type='brand')
    models = Entity.objects.filter(type='model')
    print(f"\nAvailable brands: {brands.count()}")
    print(f"Available models: {models.count()}")
    
    if brands.exists():
        print("Sample brands:", [b.name for b in brands[:5]])
    
    if models.exists():
        print("Sample models:", [m.name for m in models[:5]])
    
    # Show products with brand/model data
    products_with_entities = Product.objects.filter(
        status='published'
    ).exclude(brand__isnull=True, model__isnull=True)
    
    print(f"\nProducts with brand/model data: {products_with_entities.count()}")
    
    for product in products_with_entities[:5]:
        print(f"- {product.title}: {product.brand_name} {product.model_name}")

if __name__ == '__main__':
    test_related_products_logic()