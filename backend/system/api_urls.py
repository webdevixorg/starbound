from django.urls import path, include

urlpatterns = [
    # Core app endpoints
    path('', include('app.urls')),
    # Authentication endpoints (login, register, etc.)
    path('', include('authentication.urls')),
    # User profile management
    path('', include('profiles.urls')),
    # Chat/message system
    path('', include('chat.urls')),
    # Categories management
    path('', include('categories.urls')),
    # Entities management
    path('', include('entities.urls')),
    # Forum features
    path('', include('forum.urls')),
    # Location data
    path('', include('locations.urls')),
    # Order processing
    path('', include('orders.urls')),
    # Review system
    path('', include('reviews.urls')),
    # Support system
    path('', include('support.urls')),
    # User settings
    path('', include('user_settings.urls')),
    # Visit tracking
    path('', include('visits.urls')),
    # File uploads
    path('', include('uploads.urls')),
]
