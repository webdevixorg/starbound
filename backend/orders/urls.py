from django.urls import path, include
from rest_framework.routers import SimpleRouter
from .views import OrderViewSet

# Create a router instance to automatically generate URL patterns for viewsets
router = SimpleRouter()

# Register the OrderViewSet with the router
# This will create CRUD endpoints for 'product-orders' (e.g., /product-orders/, /product-orders/<id>/)
router.register(r'product-orders', OrderViewSet, basename='order')

# Include the automatically generated routes from the router in the app's URL patterns
urlpatterns = [
    path('', include(router.urls)),
]
