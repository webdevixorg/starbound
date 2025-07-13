from django.urls import path
from .views import SignUpView, SignInView

# Define URL patterns for user authentication
urlpatterns = [
    # Route for user registration
    path('signup/', SignUpView.as_view(), name='signup'),

    # Route for user login
    path('signin/', SignInView.as_view(), name='signin'),
]
