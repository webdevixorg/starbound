from django.urls import path
from .views import AccountSettingsView, OrderDetailView, OrderView, NotificationView, ProfileDetail, HistoryView, UpdateDetailView, UpdateListView, TripListView, TripDetailView, WishlistDetailView, WishlistView

urlpatterns = [
    path('profile/', ProfileDetail.as_view(), name='profile-detail'),
    path('account-settings/', AccountSettingsView.as_view(), name='account-settings'),
    path('account-settings/update/', AccountSettingsView.as_view(), name='account-update'),
    path('trips/', TripListView.as_view(), name='trip-list'),
    path('trips/<int:pk>/', TripDetailView.as_view(), name='trip-detail'),
    path('history/', HistoryView.as_view(), name='history'),
    path('wishlist/', WishlistView.as_view(), name='wishlist'),
    path('wishlist/<int:pk>/', WishlistDetailView.as_view(), name='wishlist-detail'),
    path('orders/', OrderView.as_view(), name='order-list'),
    path('orders/<int:pk>/', OrderDetailView.as_view(), name='order-detail'),
    path('notifications/', NotificationView.as_view(), name='notification-list'),
    path('notifications/<int:pk>/', NotificationView.as_view(), name='notification-detail'),
    path('updates/', UpdateListView.as_view(), name='update-list'),
    path('updates/<int:pk>/', UpdateListView.as_view(), name='update-detail'),
]
