#!/usr/bin/env python
"""
Script to add category relationships to posts 1037 and 1038
Run this with: python manage.py shell < add_categories_to_posts.py
"""

import os
import django

# Set up Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'system.settings')
django.setup()

from app.posts.models import Post
from categories.models import Category

try:
    # Get the posts
    post_1037 = Post.objects.get(id=1037)
    post_1038 = Post.objects.get(id=1038)
    
    # Get the categories
    category_89 = Category.objects.get(id=89)  # How-To Guides
    category_90 = Category.objects.get(id=90)  # News & Updates
    
    # Add categories to posts
    post_1037.categories.add(category_90)  # Add "News & Updates" to post 1037
    post_1038.categories.add(category_89)  # Add "How-To Guides" to post 1038
    
    print(f"Successfully added categories:")
    print(f"Post 1037 '{post_1037.title}' -> Category '{category_90.name}'")
    print(f"Post 1038 '{post_1038.title}' -> Category '{category_89.name}'")
    
    # Verify the assignments
    print(f"\nVerification:")
    print(f"Post 1037 categories: {[cat.name for cat in post_1037.categories.all()]}")
    print(f"Post 1038 categories: {[cat.name for cat in post_1038.categories.all()]}")
    
except Exception as e:
    print(f"Error: {e}")