from django.contrib.auth.models import User, Group
from rest_framework import generics, status
from rest_framework.response import Response
from django.contrib.auth import authenticate
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView

from .serializers import SignUpSerializer, SignInSerializer, UserSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from .tokens import CustomTokenObtainPairSerializer


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
