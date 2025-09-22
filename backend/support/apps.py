from django.apps import AppConfig


class SupportConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'support'
    verbose_name = 'Support System'
    
    def ready(self):
        # Import signal handlers when the app is ready
        pass