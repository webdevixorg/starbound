from django.urls import path, include
from rest_framework.routers import SimpleRouter
from .views import ImageViewSet, UserImageViewSet

# Create a router and register our viewsets with it
# Set trailing_slash=True to ensure URLs end with '/'
router = SimpleRouter(trailing_slash=True)
router.register(r'images', ImageViewSet, basename='image')
router.register(r'user-images', UserImageViewSet, basename='user-image')

# The API URLs are now determined automatically by the router
urlpatterns = [
    path('', include(router.urls)),
]