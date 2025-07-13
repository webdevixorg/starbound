from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LocationViewSet, SubLocationListByLocation

# Create a router instance to automatically generate URLs for viewsets
router = DefaultRouter()

# Register LocationViewSet with the router under the prefix 'locations'
# This generates standard RESTful endpoints for locations (list, retrieve, create, etc.)
router.register(r'locations', LocationViewSet)

urlpatterns = [
    # Include all automatically generated routes from the router
    path('', include(router.urls)),

    # Custom URL pattern for listing sublocations under a specific location by its ID
    # Example URL: /locations/5/sublocations/
    path(
        'locations/<int:location_id>/sublocations/', 
        SubLocationListByLocation.as_view(), 
        name='sublocation-list-by-location'
    ),
]
