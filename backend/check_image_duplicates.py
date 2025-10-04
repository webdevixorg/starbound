#!/usr/bin/env python
"""
Test script to check for image duplication issues
"""
import os
import sys
import django

# Add the project root to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Configure Django settings
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'system.settings')
django.setup()

from uploads.models import Image
from django.contrib.contenttypes.models import ContentType

def check_duplicate_images():
    """Check for duplicate images in the database"""
    
    print("=== Image Duplication Check ===")
    
    # Find images with same path and object_id
    all_images = Image.objects.all()
    
    # Group by content and path
    image_groups = {}
    for image in all_images:
        key = f"{image.content_type.id}_{image.object_id}_{image.image_path}"
        if key not in image_groups:
            image_groups[key] = []
        image_groups[key].append(image)
    
    # Find duplicates
    duplicates = []
    for key, images in image_groups.items():
        if len(images) > 1:
            duplicates.append((key, images))
    
    if duplicates:
        print(f"Found {len(duplicates)} sets of duplicate images:")
        for key, images in duplicates:
            content_type_id, object_id, image_path = key.split('_', 2)
            print(f"\nDuplicate set - Content Type: {content_type_id}, Object: {object_id}, Path: {image_path}")
            for img in images:
                print(f"  - ID: {img.id}, Alt: {img.alt}, Order: {img.order}, Created: {img.created_at}")
    else:
        print("No duplicate images found!")
    
    # Summary statistics
    print(f"\nTotal images: {all_images.count()}")
    content_types = Image.objects.values('content_type').distinct().count()
    print(f"Different content types: {content_types}")
    
    # Show content type breakdown
    print("\nImages by content type:")
    for ct in ContentType.objects.all():
        count = Image.objects.filter(content_type=ct).count()
        if count > 0:
            print(f"  {ct.model}: {count} images")

def suggest_cleanup():
    """Suggest cleanup for duplicate images"""
    
    print("\n=== Cleanup Suggestions ===")
    
    # Find images with same path and object_id (keep the newest)
    all_images = Image.objects.all()
    image_groups = {}
    
    for image in all_images:
        key = f"{image.content_type.id}_{image.object_id}_{image.image_path}"
        if key not in image_groups:
            image_groups[key] = []
        image_groups[key].append(image)
    
    to_delete = []
    for key, images in image_groups.items():
        if len(images) > 1:
            # Sort by created_at (newest first) and keep the first one
            images.sort(key=lambda x: x.created_at, reverse=True)
            to_delete.extend(images[1:])  # Mark all but the newest for deletion
    
    if to_delete:
        print(f"Suggested {len(to_delete)} images for deletion:")
        for img in to_delete:
            print(f"  - Delete ID: {img.id} (Alt: {img.alt}, Created: {img.created_at})")
        
        confirm = input(f"\nDelete these {len(to_delete)} duplicate images? (y/N): ")
        if confirm.lower() == 'y':
            for img in to_delete:
                print(f"Deleting image ID: {img.id}")
                img.delete()
            print(f"Deleted {len(to_delete)} duplicate images!")
        else:
            print("Cleanup cancelled.")
    else:
        print("No duplicates to clean up!")

if __name__ == '__main__':
    check_duplicate_images()
    suggest_cleanup()