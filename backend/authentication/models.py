from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from rest_framework.authtoken.models import Token as BaseToken
import secrets
import string

# Custom Token model with different table name
class Token(BaseToken):
    class Meta:
        proxy = False  # Make it a concrete model, not a proxy
        db_table = 'auth_token_token'
        verbose_name = 'Token'
        verbose_name_plural = 'Tokens'


class PasswordResetToken(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    token = models.CharField(max_length=100, unique=True)
    email = models.EmailField()
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    used = models.BooleanField(default=False)
    
    def save(self, *args, **kwargs):
        if not self.token:
            self.token = self.generate_token()
        if not self.expires_at:
            # Token expires after 24 hours
            self.expires_at = timezone.now() + timezone.timedelta(hours=24)
        super().save(*args, **kwargs)
    
    @staticmethod
    def generate_token():
        """Generate a secure random token"""
        length = 50
        characters = string.ascii_letters + string.digits
        return ''.join(secrets.choice(characters) for _ in range(length))
    
    def is_expired(self):
        """Check if token has expired"""
        return timezone.now() > self.expires_at
    
    def is_valid(self):
        """Check if token is valid (not used and not expired)"""
        return not self.used and not self.is_expired()
    
    def __str__(self):
        return f"Password reset token for {self.user.username}"
    
    class Meta:
        db_table = 'auth_password_reset_tokens'  # Custom table name
        ordering = ['-created_at']