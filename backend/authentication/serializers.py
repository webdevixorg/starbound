from rest_framework import serializers
from django.contrib.auth.models import User
from rest_framework_simplejwt.tokens import RefreshToken


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
