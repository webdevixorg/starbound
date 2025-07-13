from django.apps import AppConfig

# Configuration class for the 'authentication' app
class AuthenticationConfig(AppConfig):
    # Default primary key type for models in this app (BigAutoField uses 64-bit integers)
    default_auto_field = 'django.db.models.BigAutoField'

    # Name of the app as recognized by Django
    name = 'authentication'
