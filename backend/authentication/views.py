from django.contrib.auth.models import User, Group
from rest_framework import generics, status
from rest_framework.response import Response
from django.contrib.auth import authenticate
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.views import TokenObtainPairView

from .serializers import SignUpSerializer, SignInSerializer, UserSerializer
from rest_framework_simplejwt.tokens import RefreshToken
from .tokens import CustomTokenObtainPairSerializer

class SignUpView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = SignUpSerializer
    permission_classes = [AllowAny]

    def perform_create(self, serializer):
        user = serializer.save()
        # Assign default "Customer" role to the new user
        customer_group, created = Group.objects.get_or_create(name="Customer")
        user.groups.add(customer_group)

class SignInView(generics.GenericAPIView):
    serializer_class = SignInSerializer
    permission_classes = [AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = authenticate(username=serializer.validated_data['username'], password=serializer.validated_data['password'])
        if user is not None:
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': UserSerializer(user).data,
            })
        return Response({"detail": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)


class StarBoundTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer