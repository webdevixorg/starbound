# orders/serializers.py
from django.conf import settings
from rest_framework import serializers
from django.contrib.contenttypes.models import ContentType
from app.product.models import Product
from uploads.models import Image
from .models import Order

class OrderItemSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    quantity = serializers.IntegerField()

class OrderSerializer(serializers.ModelSerializer):
    order_data = OrderItemSerializer(many=True)
    
    class Meta:
        model = Order
        fields = ['id', 'billing_data', 'shipping_data', 'order_data', 'selected_payment_method', 'coupon_code', 'ship_to_different_address', 'created_at']

    def create(self, validated_data):
        order_data = validated_data.pop('order_data')
        order_data_with_prices = []
        for item in order_data:
            order_data_with_prices.append({
                'id': item['id'],
                'quantity': item['quantity'],
            })
        validated_data['order_data'] = order_data_with_prices
        order = Order.objects.create(**validated_data)
        return order

    def to_representation(self, instance):
        request = self.context.get('request')
        representation = super().to_representation(instance)
        order_data_with_details = []
        content_type = ContentType.objects.get(model='product')
        media_url = settings.MEDIA_URL

        for item in instance.order_data:
            product = Product.objects.get(id=item['id'])
            image = Image.objects.filter(content_type=content_type, object_id=item['id'], order=1).first()
            image_url = request.build_absolute_uri(f"{media_url}{image.image_path}") if image and request else None


            order_data_with_details.append({
                'id': item['id'],
                'quantity': item['quantity'],
                'price': float(product.price),  # Convert Decimal to float
                'name': product.title,
                'image_url': image_url,
            })
        representation['order_data'] = order_data_with_details
        return representation