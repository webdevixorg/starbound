from django.db import models
from django.contrib.auth.models import User  # Default User model
from app.product.models import Product  # adjust import path accordingly


class Review(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews')
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='reviews', null=True, blank=True)  # link to product
    rating = models.PositiveIntegerField()
    comment = models.TextField()
    approved = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Review by {self.user.username} for {self.product.title}"

    class Meta:
        db_table = 'app_reviews'
        ordering = ['-created_at']
