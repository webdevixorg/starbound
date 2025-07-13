from django.apps import AppConfig

# Configuration class for the 'orders' app
class OrdersConfig(AppConfig):
    # Set the default primary key field type for models in this app
    default_auto_field = 'django.db.models.BigAutoField'

    # The name of the app; must match the app folder name
    name = 'orders'
