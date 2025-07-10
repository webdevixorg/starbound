from django.db import models
from django.contrib.auth import get_user_model

User = get_user_model()

class Visit(models.Model):
    ITEM_TYPES = [
        ('product', 'Product'),
        # Add other item types here if needed
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='visits')
    item_id = models.PositiveIntegerField()
    item_type = models.CharField(max_length=50, choices=ITEM_TYPES)
    timestamp = models.DateTimeField()

    class Meta:
        ordering = ['-timestamp']
        unique_together = ('user', 'item_id', 'item_type')  # Optional
        db_table = 'app_visits'  # Set explicit table name

    def __str__(self):
        return f"{self.user.username} visited {self.item_type} {self.item_id} at {self.timestamp}"
