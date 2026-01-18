from django.urls import path, include
from rest_framework.routers import SimpleRouter
from .views import ThreadViewSet

# Create a DefaultRouter instance to automatically generate URL patterns for viewsets
router = SimpleRouter()

# Register the ThreadViewSet viewset with the router under the 'forum' prefix
router.register(r'forum', ThreadViewSet, basename='forum')

urlpatterns = [
    # Include all the automatically generated routes from the router
    path('', include(router.urls)),
    path('stats/', ThreadViewSet.as_view({'get': 'stats'}), name='forum-stats'),
]