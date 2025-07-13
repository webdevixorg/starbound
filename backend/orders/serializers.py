from django.conf import settings
from rest_framework import serializers
from django.contrib.contenttypes.models import ContentType
from app.product.models import Product
from uploads.models import Image
from .models import Order

# Serializer for individual order items inside an order
class OrderItemSerializer(serializers.Serializer):
    id = serializers.IntegerField()        # Product ID
    quantity = serializers.IntegerField()  # Quantity ordered of this product


# Serializer for the Order model
class OrderSerializer(serializers.ModelSerializer):
    # Nested serializer to handle list of order items (products and quantities)
    order_data = OrderItemSerializer(many=True)
    
    class Meta:
        model = Order
        # Fields included in serialization/deserialization
        fields = [
            'id',
            'billing_data',              # Billing information (likely a JSON/dict field)
            'shipping_data',             # Shipping information (likely a JSON/dict field)
            'order_data',                # List of ordered items (product IDs + quantities)
            'selected_payment_method',   # Payment method chosen
            'coupon_code',               # Coupon applied if any
            'ship_to_different_address',# Boolean flag for shipping address
            'created_at',                # Timestamp of order creation
        ]

    def create(self, validated_data):
        # Pop out nested order items data before creating the order instance
        order_data = validated_data.pop('order_data')
        
        # Prepare order_data with just id and quantity (you can expand here if needed)
        order_data_with_prices = []
        for item in order_data:
            order_data_with_prices.append({
                'id': item['id'],
                'quantity': item['quantity'],
            })
        
        # Attach cleaned order_data back to validated_data for order creation
        validated_data['order_data'] = order_data_with_prices
        
        # Create and return the Order instance
        order = Order.objects.create(**validated_data)
        return order

    def to_representation(self, instance):
        # Customize the output representation of the Order instance
        request = self.context.get('request')
        
        # Get the default representation first
        representation = super().to_representation(instance)
        
        # Prepare detailed info for each order item (product info + image)
        order_data_with_details = []
        
        # ContentType to filter images related to 'product'
        content_type = ContentType.objects.get(model='product')
        
        # Media URL prefix for building full image URLs
        media_url = settings.MEDIA_URL

        for item in instance.order_data:
            # Fetch product details by ID
            product = Product.objects.get(id=item['id'])
            
            # Fetch associated product image filtered by content type and object id
            # The 'order=1' filter likely means only the first/main image
            image = Image.objects.filter(content_type=content_type, object_id=item['id'], order=1).first()
            
            # Build absolute URL for the image if available and request context exists
            image_url = request.build_absolute_uri(f"{media_url}{image.image_path}") if image and request else None

            # Append detailed item data to the list
            order_data_with_details.append({
                'id': item['id'],
                'quantity': item['quantity'],
                'price': float(product.price),  # Convert Decimal to float for JSON serialization
                'name': product.title,
                'image_url': image_url,
            })
        
        # Replace the order_data field with detailed product info
        representation['order_data'] = order_data_with_details
        
        return representation
