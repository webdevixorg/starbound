from rest_framework.response import Response
from django.utils import timezone
from rest_framework import generics, permissions, status
from rest_framework.pagination import PageNumberPagination

from django.contrib.auth.models import User
from rest_framework_simplejwt.views import TokenObtainPairView
from .models import Order, Notification, Profile, Update, Trip, Wishlist
from app.product.models import Product

from .serializers import NotificationSerializer, ProfileSerializer, UpdateSerializer, TripSerializer, UserSerializer, WishlistSerializer, OrderSerializer

class ProfileDetail(generics.RetrieveUpdateAPIView):
    serializer_class = ProfileSerializer
    # permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return Profile.objects.get(user=self.request.user)

    def put(self, request, *args, **kwargs):
        instance = self.get_object()
        data = request.data

        # Handle image update
        if 'image' in data:
            image_name = data.get('image', None)
            if image_name == '':  # If the image is deleted
                instance.image = None
            else:
                instance.image = image_name  # Update the image field with the file name

        serializer = self.get_serializer(instance, data=data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        return Response(serializer.data)   

class AccountSettingsView(generics.RetrieveUpdateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_object(self):
        return self.request.user

class StarBoundTokenObtainPairView(TokenObtainPairView):
    permission_classes = (permissions.AllowAny,)


class TripListView(generics.ListCreateAPIView):
    queryset = Trip.objects.all()
    serializer_class = TripSerializer
    permission_classes = [permissions.IsAuthenticated]

class TripDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Trip.objects.all()
    serializer_class = TripSerializer
    permission_classes = [permissions.IsAuthenticated]

class HistoryView(generics.ListAPIView):
    serializer_class = TripSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None  # This disables pagination for this view

    def get_queryset(self):
        return Trip.objects.filter(date__lt=timezone.now())


class WishlistView(generics.ListCreateAPIView):
    serializer_class = WishlistSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None  # This disables pagination for this view

    def get_queryset(self):
        # Return only the wishlist items for the authenticated user
        return Wishlist.objects.filter(user=self.request.user)

    def post(self, request, *args, **kwargs):
        user = request.user  # Get the authenticated user
        product_id = request.data.get('product_id')  # Get the product ID from the request data

        if not product_id:
            return Response({'error': 'Product ID is required'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            product = Product.objects.get(id=product_id)  # Fetch the product by ID
        except Product.DoesNotExist:
            return Response({'error': 'Product not found'}, status=status.HTTP_404_NOT_FOUND)

        # Check if the product is already in the user's wishlist
        wishlist_item, created = Wishlist.objects.get_or_create(user=user, product=product)

        if created:
            return Response({'message': 'Product added to wishlist'}, status=status.HTTP_201_CREATED)
        else:
            return Response({'message': 'Product is already in the wishlist'}, status=status.HTTP_200_OK)

class WishlistDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Wishlist.objects.all()
    serializer_class = WishlistSerializer
    permission_classes = [permissions.IsAuthenticated]

class OrderView(generics.ListCreateAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None  # This disables pagination for this view


class OrderDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Order.objects.all()
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]
    
class NotificationView(generics.ListCreateAPIView):
    serializer_class = NotificationSerializer
    pagination_class = PageNumberPagination
    pagination_class.page_size = 8  
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        return Notification.objects.filter(user=user).order_by('-timestamp')

    def put(self, request, *args, **kwargs):
        notification_id = kwargs.get('pk')
        try:
            notification = Notification.objects.get(id=notification_id, user=request.user)
            notification.is_read = True
            notification.save()
            serializer = self.get_serializer(notification)
            return Response(serializer.data)
        except Notification.DoesNotExist:
            return Response({"error": "Notification not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
class UpdateListView(generics.ListCreateAPIView):
    serializer_class = UpdateSerializer
    pagination_class = PageNumberPagination
    pagination_class.page_size = 8  
    permission_classes = [permissions.IsAuthenticated]  

    def get_queryset(self):
        user = self.request.user
        return Update.objects.filter(user=user).order_by('-timestamp')

    def put(self, request, *args, **kwargs):
        _update_id = kwargs.get('pk')
        try:
            _update = Update.objects.get(id=_update_id, user=request.user)
            _update.is_read = True
            _update.save()
            serializer = self.get_serializer(_update)
            return Response(serializer.data)
        except Update.DoesNotExist:
            return Response({"error": " Update not found."}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class UpdateDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Update.objects.all()
    serializer_class = UpdateSerializer

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        instance.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)