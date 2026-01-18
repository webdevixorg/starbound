# urls.py

from django.urls import path, include
from rest_framework.routers import SimpleRouter
from .views import PostDetailView, FrontendPostView, ProfilePostView

# Main router
router = SimpleRouter()
router.register(r'f', FrontendPostView, basename='frontend-post')
router.register(r'p', ProfilePostView, basename='profile-post')


urlpatterns = [
    # API routes
    path('', include(router.urls)),

    path('popular/', FrontendPostView.as_view({'get': 'popular'}), name='post-popular'),
    path('trending/', FrontendPostView.as_view({'get': 'trending'}), name='post-trending'),
    path('latest/', FrontendPostView.as_view({'get': 'latest'}), name='post-latest'),
    path('<slug:slug>/change-status/', PostDetailView.as_view(), name='post-status'),
    path('<int:pk>/increment/', ProfilePostView.as_view({'post': 'increment_visitor_count'}), name='post-increment-visitor-count'),
    path('update-aggregate-counts/', ProfilePostView.as_view({'post': 'update_aggregate_counts'}), name='update-aggregate-counts'),
]
