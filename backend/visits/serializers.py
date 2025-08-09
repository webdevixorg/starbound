# visits/serializers.py

from rest_framework import serializers
from datetime import datetime
from django.utils.dateparse import parse_datetime
from .models import Visit
from app.product.models import Product as ProductModel

class VisitSerializer(serializers.ModelSerializer):
    product = serializers.SerializerMethodField()
    timestamp = serializers.CharField()  # Accept as string first

    class Meta:
        model = Visit
        fields = ['id', 'item_id', 'item_type', 'timestamp', 'product']
        
    def validate_timestamp(self, value):
        """Convert string timestamp to datetime object"""
        if isinstance(value, str):
            # Try to parse ISO format timestamp
            try:
                parsed_date = parse_datetime(value)
                if parsed_date is None:
                    # Try alternative parsing
                    parsed_date = datetime.fromisoformat(value.replace('Z', '+00:00'))
                return parsed_date
            except (ValueError, TypeError):
                raise serializers.ValidationError("Invalid timestamp format. Use ISO format.")
        return value
        
    def create(self, validated_data):
        # The user will be passed from the view via serializer.save(user=request.user)
        return super().create(validated_data)

    def get_product(self, obj):
        # only for product visits
        if obj.item_type != 'product':
            return None

        try:
            product = ProductModel.objects.get(id=obj.item_id)
        except ProductModel.DoesNotExist:
            return None

        # Build a minimal dict of pure primitives:
        result = {
            'title': str(product.title),               # ensure it's a string
            'price': str(product.price),               # convert Decimal to str
            'image': None
        }

        # If your Product has a direct ImageField called `image`
        if hasattr(product, 'image') and product.image: # type: ignore
            result['image'] = str(product.image.url) # type: ignore

        else:
            # Or if you have a related model with related_name='images'
            imgs = getattr(product, 'images', None)
            if imgs and hasattr(imgs, 'first'):
                first = imgs.first()
                # Use .image_path (which should be a CharField) or cast it
                img_path = getattr(first, 'image_path', None)
                if img_path is not None:
                    result['image'] = str(img_path)

        return result
