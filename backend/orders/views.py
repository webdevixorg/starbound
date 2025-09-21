from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import get_user_model

from .models import Order
from .serializers import OrderSerializer


User = get_user_model()

# ViewSet class that provides CRUD operations for Order model
class OrderViewSet(viewsets.ModelViewSet):
    # Serializer class that will handle serialization/deserialization of Order instances
    serializer_class = OrderSerializer
    
    # Require authentication for all operations
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """
        Filter orders based on user role, ownership, and URL parameters:
        - If user_id parameter is provided:
            * Staff/Admin: return that user's orders
            * Regular users: ignore it and return their own orders
        - Without user_id:
            * Staff/Admin: return all orders
            * Regular users: return their own orders
        """
        user = self.request.user
        user_id = self.request.GET.get('user_id')

        if user_id:
            try:
                target_user = User.objects.get(id=user_id)

                if user.is_staff or user.is_superuser:
                    return Order.objects.filter(user=target_user).order_by('-created_at')
                else:
                    # Regular users can't fetch others' orders → return only their own
                    return Order.objects.filter(user=user).order_by('-created_at')

            except User.DoesNotExist:
                return Order.objects.none()

        # No user_id provided
        if user.is_staff or user.is_superuser:
            return Order.objects.all().order_by('-created_at')

        return Order.objects.filter(user=user).order_by('-created_at')

    # Override the create method to customize order creation handling
    def create(self, request, *args, **kwargs):
        # Deserialize and validate incoming request data using the serializer
        serializer = self.get_serializer(data=request.data)
        
        if serializer.is_valid():
            # Set the authenticated user when creating the order
            serializer.save(user=self.request.user)
            
            # Return the serialized data with HTTP 201 Created status on success
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            # If validation fails, return the errors with HTTP 400 Bad Request status
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    # Override the update method to add permission check for fulfillment updates
    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        user = request.user
        
        # Check if trying to update fulfillment status
        if 'fulfillment' in request.data:
            # Only staff or superuser can update fulfillment status
            if not (user.is_staff or user.is_superuser):
                return Response(
                    {'detail': 'Only staff and admin users can update fulfillment status.'},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        # Proceed with normal update
        return super().update(request, *args, **kwargs)
    
    # Override the partial_update method (for PATCH requests)
    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        user = request.user
        
        # Check if trying to update fulfillment status
        if 'fulfillment' in request.data:
            # Only staff or superuser can update fulfillment status
            if not (user.is_staff or user.is_superuser):
                return Response(
                    {'detail': 'Only staff and admin users can update fulfillment status.'},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        # Proceed with normal partial update
        return super().partial_update(request, *args, **kwargs)
