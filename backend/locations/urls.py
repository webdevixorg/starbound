from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import LocationViewSet, SubLocationListByLocation

router = DefaultRouter()
router.register(r'locations', LocationViewSet)

urlpatterns = [
    path('', include(router.urls)),
    # Add the custom view for listing sublocations by location ID
    path('locations/<int:location_id>/sublocations/', SubLocationListByLocation.as_view(), name='sublocation-list-by-location'),
]