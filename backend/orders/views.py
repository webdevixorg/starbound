from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .models import Order
from .serializers import OrderSerializer

# ViewSet class that provides CRUD operations for Order model
class OrderViewSet(viewsets.ModelViewSet):
    # Queryset of all Order instances to operate on
    queryset = Order.objects.all()
    
    # Serializer class that will handle serialization/deserialization of Order instances
    serializer_class = OrderSerializer
    
    # Require authentication for all operations
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """
        Filter orders based on user role:
        - Admin/Staff: Can see all orders
        - Clients: Can only see their own orders
        """
        user = self.request.user
        
        # Admin and staff can see all orders
        if user.is_staff or user.is_superuser:
            return Order.objects.all().order_by('-created_at')
        
        # Regular users can only see their own orders
        # Note: You may need to add a user field to Order model to filter properly
        # For now, returning all orders - update this when you add user relationship
        return Order.objects.all().order_by('-created_at')
        # TODO: Add user field to Order model and filter: Order.objects.filter(user=user)

    # Override the create method to customize order creation handling
    def create(self, request, *args, **kwargs):
        # Deserialize and validate incoming request data using the serializer
        serializer = self.get_serializer(data=request.data)
        
        if serializer.is_valid():
            # If data is valid, save the new order instance to the database
            self.perform_create(serializer)
            
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
