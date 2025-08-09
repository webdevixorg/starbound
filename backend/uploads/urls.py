from django.urls import path
from .views import ImageViewSet, UserImageViewSet

urlpatterns = [ 
    path('images/', ImageViewSet.as_view({ 'get': 'list', 'post': 'create' }), name='image-list'),
    path('images/<int:pk>', ImageViewSet.as_view({'get': 'retrieve', 'patch': 'update', 'delete': 'delete'}), name='image-detail'),
    path('images/user/', UserImageViewSet.as_view({'get': 'retrieve', 'post': 'create', 'patch': 'update', 'delete': 'delete'}), name='user-image-detail'),
]