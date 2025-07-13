# Import Django admin and URL handling utilities
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

# Import JWT authentication views from SimpleJWT
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

# Import your custom token view
from authentication.views import StarBoundTokenObtainPairView

# Define URL patterns for your project
urlpatterns = [
    # Admin site URL
    path('admin/', admin.site.urls),

    # Main application API endpoints
    path('api/', include('app.urls')),  # Core app endpoints
    path('api/', include('authentication.urls')),  # Authentication endpoints (login, register, etc.)
    path('api/', include('profiles.urls')),  # User profile management
    path('api/', include('chat.urls')),  # Chat/message system
    path('api/', include('categories.urls')),  # Category management
    path('api/', include('locations.urls')),  # Location-related endpoints
    path('api/', include('uploads.urls')),  # File upload endpoints
    path('api/', include('orders.urls')),  # Order processing
    path('api/', include('reviews.urls')),  # Review system
    path('api/', include('visits.urls')),  # Visit tracking or analytics

    # JWT Authentication endpoints
    # Default JWT token obtain view (commented out, using custom view instead)
    # path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    # Custom token obtain view for your application
    path('api/token/', StarBoundTokenObtainPairView.as_view(), name='token_obtain_pair'),

    # JWT token refresh endpoint
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]

# Serve media files during development (when DEBUG=True)
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
