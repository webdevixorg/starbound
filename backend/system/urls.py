# Import Django admin and URL handling utilities
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import JsonResponse

# Import JWT authentication views from SimpleJWT
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

# Import your custom token view
from authentication.views import StarBoundTokenObtainPairView

def api_root(request):
    return JsonResponse({"status": "ok", "message": "Starbound API is running"})

# Define URL patterns for your project
urlpatterns = [
    path('', api_root, name='api-root'), # Add root view
    # Admin site URL
    path('admin/', admin.site.urls),

    # Main application API endpoints
    path('api/', include('system.api_urls')),  # Consolidated API endpoints

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

