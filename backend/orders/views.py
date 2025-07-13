from rest_framework import viewsets, status
from rest_framework.response import Response
from .models import Order
from .serializers import OrderSerializer

# ViewSet class that provides CRUD operations for Order model
class OrderViewSet(viewsets.ModelViewSet):
    # Queryset of all Order instances to operate on
    queryset = Order.objects.all()
    
    # Serializer class that will handle serialization/deserialization of Order instances
    serializer_class = OrderSerializer

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
