import uuid
from django.db import models
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError


def validate_settings_json(value):
    """Validate the structure of the settings JSON"""
    if not isinstance(value, dict):
        raise ValidationError("Settings must be a valid JSON object")
    
    # Define valid structure
    valid_sections = {'security', 'preferences', 'notifications'}
    
    # Check if any invalid sections exist
    invalid_sections = set(value.keys()) - valid_sections
    if invalid_sections:
        raise ValidationError(f"Invalid settings sections: {', '.join(invalid_sections)}")
    
    # Validate security settings
    if 'security' in value:
        security = value['security']
        if not isinstance(security, dict):
            raise ValidationError("Security settings must be an object")
        
        valid_security_keys = {'twoFactorSMS', 'twoFactorTOTP', 'loginNotifications'}
        invalid_keys = set(security.keys()) - valid_security_keys
        if invalid_keys:
            raise ValidationError(f"Invalid security settings: {', '.join(invalid_keys)}")
    
    # Validate preferences settings
    if 'preferences' in value:
        preferences = value['preferences']
        if not isinstance(preferences, dict):
            raise ValidationError("Preferences settings must be an object")
        
        valid_preference_keys = {'language', 'theme', 'timezone', 'dateFormat', 'currency'}
        invalid_keys = set(preferences.keys()) - valid_preference_keys
        if invalid_keys:
            raise ValidationError(f"Invalid preference settings: {', '.join(invalid_keys)}")
    
    # Validate notification settings
    if 'notifications' in value:
        notifications = value['notifications']
        if not isinstance(notifications, dict):
            raise ValidationError("Notification settings must be an object")
        
        valid_notification_keys = {'email', 'sms', 'push', 'marketing_emails', 'order_updates', 'forum_notifications'}
        invalid_keys = set(notifications.keys()) - valid_notification_keys
        if invalid_keys:
            raise ValidationError(f"Invalid notification settings: {', '.join(invalid_keys)}")


class UserSettings(models.Model):
    """User settings model with JSONB storage for flexible settings"""
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='user_settings')
    settings = models.JSONField(
        default=dict,
        validators=[validate_settings_json],
        help_text="User settings stored as JSON"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'profile_usersettings'
        verbose_name = 'User Settings'
        verbose_name_plural = 'User Settings'

    def __str__(self):
        return f"Settings for {self.user.username}"

    @property
    def default_settings(self):
        """Return default settings structure"""
        return {
            "security": {
                "twoFactorSMS": False,
                "twoFactorTOTP": False,
                "loginNotifications": True
            },
            "preferences": {
                "language": "en",
                "theme": "light",
                "timezone": "UTC",
                "dateFormat": "MM/DD/YYYY",
                "currency": "USD"
            },
            "notifications": {
                "email": True,
                "sms": False,
                "push": True,
                "marketing_emails": False,
                "order_updates": True,
                "forum_notifications": True
            }
        }

    def get_settings(self):
        """Get settings with defaults for missing keys"""
        default = self.default_settings
        current = self.settings or {}
        
        # Merge settings with defaults
        merged = {}
        for section, section_defaults in default.items():
            merged[section] = {**section_defaults, **current.get(section, {})}
        
        return merged

    def update_settings(self, new_settings, section=None):
        """Update settings for a specific section or all settings"""
        current_settings = self.get_settings()
        
        if section:
            # Update specific section
            if section in current_settings:
                current_settings[section].update(new_settings)
                self.settings = current_settings
            else:
                raise ValueError(f"Invalid settings section: {section}")
        else:
            # Update all settings
            for section_name, section_data in new_settings.items():
                if section_name in current_settings:
                    current_settings[section_name].update(section_data)
            self.settings = current_settings
        
        self.full_clean()  # Validate before saving
        self.save()

    def get_security_settings(self):
        """Get security settings"""
        return self.get_settings().get('security', {})

    def get_preference_settings(self):
        """Get preference settings"""
        return self.get_settings().get('preferences', {})

    def get_notification_settings(self):
        """Get notification settings"""
        return self.get_settings().get('notifications', {})

    def save(self, *args, **kwargs):
        """Override save to ensure default settings exist"""
        if not self.settings:
            self.settings = self.default_settings
        super().save(*args, **kwargs)


# Signal to create user settings when user is created
from django.db.models.signals import post_save
from django.dispatch import receiver

@receiver(post_save, sender=User)
def create_user_settings(sender, instance, created, **kwargs):
    """Create user settings when a new user is created"""
    if created:
        UserSettings.objects.create(user=instance)