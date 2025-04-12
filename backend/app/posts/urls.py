# urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PostDetailView, PostView

router = DefaultRouter()
router.register(r'', PostView, basename='post')

urlpatterns = [
    path('', include(router.urls)),
    path('popular/', PostView.as_view({'get': 'popular'}), name='post-popular'),
    path('trending/', PostView.as_view({'get': 'trending'}), name='post-trending'),
    path('latest/', PostView.as_view({'get': 'latest'}), name='post-latest'),
    path('<slug:slug>/change-status/', PostDetailView.as_view(), name='post-status'),
    path('<int:pk>/increment/', PostView.as_view({'post': 'increment_visitor_count'}), name='post-increment-visitor-count'),
    path('update-aggregate-counts/', PostView.as_view({'post': 'update_aggregate_counts'}), name='update-aggregate-counts'),
]
