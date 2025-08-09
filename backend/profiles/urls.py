from django.urls import path
from .views import (
    AccountSettingsView, 
    OrderDetailView, 
    OrderView, 
    NotificationView, 
    ProfileDetail, 
    HistoryView, 
    UpdateDetailView, 
    UpdateListView, 
    WishlistDetailView, 
    WishlistView
)

urlpatterns = [
    # Profile URLs
    path('profile/', ProfileDetail.as_view(), name='profile-detail-own'),  # Own profile (authenticated)
    path('profile/<int:pk>/', ProfileDetail.as_view(), name='profile-detail-public'),  # Public profile by user ID
    
    # Account Settings
    path('account/', AccountSettingsView.as_view(), name='account-settings'),
    path('account/update/', AccountSettingsView.as_view(), name='account-update'),
    
    # History
    path('history/', HistoryView.as_view(), name='view-history'),
    
    # Wishlist
    path('wishlist/', WishlistView.as_view(), name='wishlist-list'),
    path('wishlist/<int:pk>/', WishlistDetailView.as_view(), name='wishlist-detail'),
    
    # Orders
    path('orders/', OrderView.as_view(), name='order-list'),
    path('orders/<int:pk>/', OrderDetailView.as_view(), name='order-detail'),
    
    # Notifications
    path('notifications/', NotificationView.as_view(), name='notification-list'),
    path('notifications/<int:pk>/', NotificationView.as_view(), name='notification-detail'),
    
    # Updates
    path('updates/', UpdateListView.as_view(), name='update-list'),
    path('updates/<int:pk>/', UpdateDetailView.as_view(), name='update-detail'),
]