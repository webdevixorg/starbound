from django.contrib import admin
from .models import UserSettings


@admin.register(UserSettings)
class UserSettingsAdmin(admin.ModelAdmin):
    """Admin interface for user settings"""
    
    list_display = ('user', 'created_at', 'updated_at', 'has_two_factor')
    list_filter = ('created_at', 'updated_at')
    search_fields = ('user__username', 'user__email')
    readonly_fields = ('id', 'created_at', 'updated_at')
    
    fieldsets = (
        ('User Information', {
            'fields': ('user', 'id', 'created_at', 'updated_at')
        }),
        ('Settings', {
            'fields': ('settings',),
            'description': 'JSON structure containing user preferences, security, and notification settings'
        }),
    )
    
    def has_two_factor(self, obj):
        """Display if user has two-factor authentication enabled"""
        security = obj.get_security_settings()
        return security.get('twoFactorSMS', False) or security.get('twoFactorTOTP', False)
    
    has_two_factor.boolean = True
    has_two_factor.short_description = '2FA Enabled'
    
    def get_readonly_fields(self, request, obj=None):
        """Make user field readonly when editing existing settings"""
        if obj:  # Editing existing object
            return list(self.readonly_fields) + ['user']
        return self.readonly_fields