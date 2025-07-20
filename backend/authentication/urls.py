from django.urls import path
from .views import (
    SignUpView, 
    SignInView,
    PasswordResetRequestView,
    PasswordResetConfirmView,
    PasswordResetValidateView
)

# Define URL patterns for user authentication
urlpatterns = [
    # Route for user registration
    path('signup/', SignUpView.as_view(), name='signup'),

    # Route for user login
    path('signin/', SignInView.as_view(), name='signin'),
    
    # Password reset endpoints
    path('auth/password/reset/request/', PasswordResetRequestView.as_view(), name='password_reset_request'),
    path('auth/password/reset/confirm/', PasswordResetConfirmView.as_view(), name='password_reset_confirm'),
    path('auth/password/reset/validate/', PasswordResetValidateView.as_view(), name='password_reset_validate'),
]