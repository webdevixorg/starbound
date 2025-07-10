# system/urls.py
from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)


from authentication.views import StarBoundTokenObtainPairView


urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('app.urls')),
    path('api/', include('authentication.urls')),
    path('api/', include('profiles.urls')),
    path('api/', include('chat.urls')),  
    path('api/', include('categories.urls')),
    path('api/', include('locations.urls')),  # Include the locations app URLs
    path('api/', include('uploads.urls')),  
    path('api/', include('orders.urls')),
    path('api/', include('reviews.urls')),
    path('api/', include('visits.urls')),

    # path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/', StarBoundTokenObtainPairView.as_view(), name='token_obtain_pair'),

    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
