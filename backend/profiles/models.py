from django.db import models
from django.conf import settings
from django.contrib.auth.models import User
from app.product.models import Product 

class Profile(models.Model):
    user = models.OneToOneField(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    image = models.ImageField(upload_to='profiles/profile_images/', default='default.jpg')
    bio = models.TextField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    address = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100, blank=True)
    region = models.CharField(max_length=100, blank=True)
    postal_code = models.CharField(max_length=20, blank=True)
    country = models.CharField(max_length=100, blank=True)
    date_of_birth = models.DateField(null=True, blank=True)

    def __str__(self):
        return f'{self.user.username} Profile'


class Trip(models.Model):
    destination = models.CharField(max_length=100)
    date = models.DateField()
    duration = models.IntegerField()
    description = models.TextField()

    def __str__(self):
        return self.destination
    

class Wishlist(models.Model):
    user = models.ForeignKey('auth.User', on_delete=models.CASCADE)  # Link the wishlist to a user
    product = models.ForeignKey(Product, on_delete=models.CASCADE, default=None)  # Link to the Product model
    timestamp = models.DateTimeField(auto_now_add=True)  # Track when the product was added to the wishlist

    def __str__(self):
        return f"{self.product.title}"

class Order(models.Model):
    user = models.ForeignKey('auth.User', on_delete=models.CASCADE)
    destination = models.CharField(max_length=100)
    start_date = models.DateField()
    end_date = models.DateField()
    status = models.CharField(max_length=50)

    def __str__(self):
        return f"{self.user.username} - {self.destination}"


class Notification(models.Model):
    INFO = 'info'
    WARNING = 'warning'
    ERROR = 'error'
    NOTIFICATION_TYPE_CHOICES = [
        (INFO, 'Info'),
        (WARNING, 'Warning'),
        (ERROR, 'Error'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE)
    message = models.TextField()
    type = models.CharField(max_length=7, choices=NOTIFICATION_TYPE_CHOICES, default=INFO)
    is_read = models.BooleanField(default=False)
    timestamp = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.user.username} - {self.message}'
    
class Update(models.Model):
    message = models.CharField(max_length=255)
    type = models.CharField(max_length=50, choices=[])
    timestamp = models.DateTimeField(auto_now_add=True)
    is_read = models.BooleanField(default=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    def __str__(self):
        return f'{self.message} ({self.get_type_display()})'
