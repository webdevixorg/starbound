from rest_framework import serializers
from django.core.exceptions import ValidationError as DjangoValidationError
from .models import UserSettings


class SecuritySettingsSerializer(serializers.Serializer):
    """Serializer for security settings"""
    twoFactorSMS = serializers.BooleanField(default=False)
    twoFactorTOTP = serializers.BooleanField(default=False)
    loginNotifications = serializers.BooleanField(default=True)


class PreferenceSettingsSerializer(serializers.Serializer):
    """Serializer for preference settings"""
    language = serializers.CharField(max_length=10, default='en')
    theme = serializers.ChoiceField(choices=['light', 'dark'], default='light')
    timezone = serializers.CharField(max_length=50, default='UTC')
    dateFormat = serializers.CharField(max_length=20, default='MM/DD/YYYY')
    currency = serializers.CharField(max_length=10, default='USD')


class NotificationSettingsSerializer(serializers.Serializer):
    """Serializer for notification settings"""
    email = serializers.BooleanField(default=True)
    sms = serializers.BooleanField(default=False)
    push = serializers.BooleanField(default=True)
    marketing_emails = serializers.BooleanField(default=False)
    order_updates = serializers.BooleanField(default=True)
    forum_notifications = serializers.BooleanField(default=True)


class UserSettingsSerializer(serializers.ModelSerializer):
    """Main serializer for user settings"""
    
    security = SecuritySettingsSerializer(required=False)
    preferences = PreferenceSettingsSerializer(required=False)
    notifications = NotificationSettingsSerializer(required=False)
    
    class Meta:
        model = UserSettings
        fields = ['id', 'security', 'preferences', 'notifications', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

    def to_representation(self, instance):
        """Convert model instance to dictionary representation"""
        data = super().to_representation(instance)
        settings_data = instance.get_settings()
        
        # Replace the nested serializer data with actual settings
        data['security'] = settings_data.get('security', {})
        data['preferences'] = settings_data.get('preferences', {})
        data['notifications'] = settings_data.get('notifications', {})
        
        return data

    def update(self, instance, validated_data):
        """Update user settings"""
        settings_update = {}
        
        # Extract nested settings data
        if 'security' in validated_data:
            settings_update['security'] = validated_data.pop('security')
        
        if 'preferences' in validated_data:
            settings_update['preferences'] = validated_data.pop('preferences')
        
        if 'notifications' in validated_data:
            settings_update['notifications'] = validated_data.pop('notifications')
        
        # Update settings using the model method
        if settings_update:
            try:
                instance.update_settings(settings_update)
            except (ValueError, DjangoValidationError) as e:
                raise serializers.ValidationError(str(e))
        
        return instance