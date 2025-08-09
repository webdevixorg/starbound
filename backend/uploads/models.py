from django.db import models
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.utils import timezone

class Image(models.Model):
    image_path = models.CharField(max_length=500)  
    alt = models.CharField(max_length=200)
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(default=timezone.now)  # Use default instead of auto_now_add

    class Meta:
        db_table = 'app_image'
        indexes = [
            models.Index(fields=['content_type', 'object_id']),
        ]

    def __str__(self):
        return f"Image with alt text: {self.alt}"
    
    def delete(self, *args, **kwargs):
        # Call the superclass delete method
        super().delete(*args, **kwargs)

class UserImage(models.Model):
    image_path = models.CharField(max_length=500)  
    alt = models.CharField(max_length=200)
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')
    order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(default=timezone.now)  # Use default instead of auto_now_add

    class Meta:
        db_table = 'app_user_image'
        indexes = [
            models.Index(fields=['content_type', 'object_id']),
        ]

    def __str__(self):
        return f"Image with alt text: {self.alt}"
    
    def delete(self, *args, **kwargs):
        # Call the superclass delete method
        super().delete(*args, **kwargs)