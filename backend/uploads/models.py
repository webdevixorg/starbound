from django.db import models
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
import os

class Image(models.Model):
    image_path = models.ImageField(upload_to='images/')
    alt = models.CharField(max_length=200)
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE)
    object_id = models.PositiveIntegerField()
    content_object = GenericForeignKey('content_type', 'object_id')
    order = models.PositiveIntegerField(default=0)
    
    class Meta:
        db_table = 'app_image'
        indexes = [
            models.Index(fields=['content_type', 'object_id']),
        ]

    def __str__(self):
        return f"Image with alt text: {self.alt}"
    
    def delete(self, *args, **kwargs):
        # Delete the file from the filesystem
        if self.image_path:
            if os.path.isfile(self.image_path.path):
                os.remove(self.image_path.path)
        # Call the superclass delete method
        super().delete(*args, **kwargs)