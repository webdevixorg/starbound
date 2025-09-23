from django.urls import path
from . import views

app_name = 'user_settings'

urlpatterns = [
    # Main settings endpoint
    path('', views.UserSettingsView.as_view(), name='user_settings'),
    
    # Individual section endpoints
    path('security/', views.security_settings, name='security_settings'),
    path('preferences/', views.preference_settings, name='preference_settings'),
    path('notifications/', views.notification_settings, name='notification_settings'),
    
    # Utility endpoints
    path('reset/', views.reset_settings, name='reset_settings'),
    path('export/', views.settings_export, name='settings_export'),
    path('import/', views.settings_import, name='settings_import'),
]