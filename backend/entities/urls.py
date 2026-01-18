from django.urls import path, include
from rest_framework.routers import SimpleRouter
from .views import EntityViewSet

router = SimpleRouter()
router.register(r'entities', EntityViewSet, basename='entity')

urlpatterns = [
    path('', include(router.urls)),
]
