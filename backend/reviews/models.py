from django.db import models
from django.contrib.auth.models import User  # Default User model
from app.product.models import Product  # adjust import path accordingly


class Review(models.Model):
    STATUS_CHOICES = [
        (0, 'Pending'),
        (1, 'Approved'),
        (2, 'Trashed'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews', null=True, blank=True)  # link to product
    rating = models.PositiveIntegerField()
    comment = models.TextField()
    status = models.IntegerField(choices=STATUS_CHOICES, default=0)  # 0=Pending, 1=Approved, 2=Trashed
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        product_title = self.product.title if self.product else "Unknown Product"
        return f"Review by {self.user.username} for {product_title}"

    class Meta:
        db_table = 'app_reviews'
        ordering = ['-created_at']
