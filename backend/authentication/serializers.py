from rest_framework import serializers
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError
from .models import PasswordResetToken

# Serializer used for user registration
class SignUpSerializer(serializers.ModelSerializer):
    # Password is write-only, so it won't be included in API responses
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ('username', 'password', 'email')  # Fields to accept from the client

    def create(self, validated_data):
        # Create a new user with hashed password using Django's built-in create_user method
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password'],
            email=validated_data['email']
        )
        return user


# Serializer for returning user details (e.g., after login or registration)
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email')  # You can expand this to include first_name, last_name, etc.


# Serializer used for handling sign-in input
class SignInSerializer(serializers.Serializer):
    # Required fields for authentication
    username = serializers.CharField(required=True)
    password = serializers.CharField(write_only=True, required=True)  # Not returned in the response


class PasswordResetRequestSerializer(serializers.Serializer):
    email = serializers.EmailField()
    
    def validate_email(self, value):
        """Check if user with this email exists"""
        try:
            user = User.objects.get(email=value)
            return value
        except User.DoesNotExist:
            raise serializers.ValidationError("No account found with this email address.")

class PasswordResetConfirmSerializer(serializers.Serializer):
    token = serializers.CharField(max_length=100)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)
    
    def validate(self, attrs):
        token = attrs.get('token')
        email = attrs.get('email')
        password = attrs.get('password')
        confirm_password = attrs.get('confirm_password')
        
        # Check if passwords match
        if password != confirm_password:
            raise serializers.ValidationError("Passwords do not match.")
        
        # Validate password strength
        try:
            validate_password(password)
        except ValidationError as e:
            raise serializers.ValidationError({"password": e.messages})
        
        # Check if token exists and is valid
        try:
            reset_token = PasswordResetToken.objects.get(
                token=token,
                email=email,
                used=False
            )
            if reset_token.is_expired():
                raise serializers.ValidationError("Reset token has expired.")
            
            attrs['reset_token'] = reset_token
            return attrs
            
        except PasswordResetToken.DoesNotExist:
            raise serializers.ValidationError("Invalid or expired reset token.")

class PasswordResetValidateSerializer(serializers.Serializer):
    token = serializers.CharField(max_length=100)
    email = serializers.EmailField()
    
    def validate(self, attrs):
        token = attrs.get('token')
        email = attrs.get('email')
        
        try:
            reset_token = PasswordResetToken.objects.get(
                token=token,
                email=email,
                used=False
            )
            if reset_token.is_expired():
                raise serializers.ValidationError("Reset token has expired.")
            
            return attrs
            
        except PasswordResetToken.DoesNotExist:
            raise serializers.ValidationError("Invalid or expired reset token.")