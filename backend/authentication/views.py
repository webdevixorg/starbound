from django.contrib.auth.models import User, Group
from rest_framework import generics, status
from rest_framework.response import Response
from django.contrib.auth import authenticate
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView

from .serializers import (
    SignUpSerializer, 
    SignInSerializer, 
    UserSerializer,     
    PasswordResetRequestSerializer, 
    PasswordResetConfirmSerializer,
    PasswordResetValidateSerializer
)

from rest_framework_simplejwt.tokens import RefreshToken
from .tokens import CustomTokenObtainPairSerializer
from .models import PasswordResetToken


from rest_framework.decorators import api_view, permission_classes
from django.core.mail import send_mail
from django.conf import settings
from django.template.loader import render_to_string
from django.utils.html import strip_tags
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt



# Handles user registration
class SignUpView(generics.CreateAPIView):
    queryset = User.objects.all()  # Base queryset (not directly used but required)
    serializer_class = SignUpSerializer  # Serializer to validate and create user
    permission_classes = [AllowAny]  # Allow public access to sign up

    def perform_create(self, serializer):
        user = serializer.save()  # Save user from validated data
        # Automatically assign new users to the "Customer" group
        customer_group, created = Group.objects.get_or_create(name="Customer")
        user.groups.add(customer_group)


# Handles user login and returns JWT tokens
class SignInView(generics.GenericAPIView):
    serializer_class = SignInSerializer  # Serializer for username/password input
    permission_classes = [AllowAny]  # Allow public access to sign in

    def post(self, request, *args, **kwargs):
        # Validate input data
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        # Authenticate user using Django's auth system
        user = authenticate(
            username=serializer.validated_data['username'],
            password=serializer.validated_data['password']
        )

        # If authentication is successful, return JWT tokens and user data
        if user is not None:
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),  # Long-lived token
                'access': str(refresh.access_token),  # Short-lived token
                'user': UserSerializer(user).data,  # Serialized user data
            })

        # If credentials are invalid
        return Response({"detail": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)


# Custom JWT login view using a customized serializer
class StarBoundTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer  # Allows adding extra data or logic to JWT response


@method_decorator(csrf_exempt, name='dispatch')
class PasswordResetRequestView(generics.CreateAPIView):
    """
    Request password reset - sends email with reset link
    """
    serializer_class = PasswordResetRequestSerializer
    permission_classes = [AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        email = serializer.validated_data['email']
        
        try:
            # Handle multiple users with same email - get the most recent one
            users = User.objects.filter(email=email).order_by('-date_joined')
            
            if users.exists():
                user = users.first()  # Get the most recently created user
                
                # Invalidate any existing tokens for this user
                PasswordResetToken.objects.filter(
                    user=user,
                    used=False
                ).update(used=True)
                
                # Create new reset token
                reset_token = PasswordResetToken.objects.create(
                    user=user,
                    email=email
                )
                
                # Send reset email
                self.send_reset_email(user, reset_token)
            
            # Always return success to prevent email enumeration
            return Response({
                'message': 'Password reset link has been sent to your email address.',
                'success': True
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            # Log the error but don't expose it to the user
            print(f"Password reset error: {e}")
            return Response({
                'message': 'Password reset link has been sent to your email address.',
                'success': True
            }, status=status.HTTP_200_OK)
    
    def send_reset_email(self, user, reset_token):
        """Send password reset email"""
        subject = 'Password Reset Request - Starbound'
        
        # Construct reset URL
        frontend_url = getattr(settings, 'FRONTEND_URL', 'http://localhost:3000')
        reset_url = f"{frontend_url}/reset-password?token={reset_token.token}&email={reset_token.email}"
        
        # Email context
        context = {
            'user': user,
            'reset_url': reset_url,
            'site_name': 'Starbound',
            'token_expiry_hours': 24
        }
        
        # Render email template
        try:
            html_message = render_to_string('email/password_reset.html', context)
            plain_message = strip_tags(html_message)
        except:
            # Fallback to plain text if template doesn't exist
            plain_message = f"""
Hello {user.first_name or user.username},

You requested a password reset for your Starbound account.

Click the link below to reset your password:
{reset_url}

This link will expire in 24 hours.

If you didn't request this reset, please ignore this email.

Best regards,
The Starbound Team
            """
            html_message = None
        
        try:
            send_mail(
                subject=subject,
                message=plain_message,
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[user.email],
                html_message=html_message,
                fail_silently=True,  # Changed to True to prevent crashes
            )
        except Exception as e:
            print(f"Email sending error: {e}")

@method_decorator(csrf_exempt, name='dispatch')
class PasswordResetConfirmView(generics.CreateAPIView):
    """
    Confirm password reset with token and set new password
    """
    serializer_class = PasswordResetConfirmSerializer
    permission_classes = [AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        reset_token = serializer.validated_data['reset_token']
        new_password = serializer.validated_data['password']
        
        # Update user password
        user = reset_token.user
        user.set_password(new_password)
        user.save()
        
        # Mark token as used
        reset_token.used = True
        reset_token.save()
        
        return Response({
            'message': 'Password has been reset successfully.',
            'success': True
        }, status=status.HTTP_200_OK)

@method_decorator(csrf_exempt, name='dispatch')
class PasswordResetValidateView(generics.CreateAPIView):
    """
    Validate password reset token without resetting password
    """
    serializer_class = PasswordResetValidateSerializer
    permission_classes = [AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        return Response({
            'message': 'Token is valid.',
            'success': True
        }, status=status.HTTP_200_OK)