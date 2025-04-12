from django.db import models

class Review(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField()
    rating = models.PositiveIntegerField()
    comment = models.TextField()

    def __str__(self):
        return f"Review by {self.name}"

    class Meta:
        db_table = 'app_reviews'