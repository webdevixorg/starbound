from rest_framework import serializers
from authentication.serializers import UserSerializer
from uploads.serializers import ImageSerializer
from .models import Product
from categories.models import Category
from uploads.models import Image  
import bleach


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'slug', 'parent']


class ProductSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True, source='user')
    images = serializers.SerializerMethodField()
    categories = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all(), many=True)  # Use PrimaryKeyRelatedField here
    location_name = serializers.CharField(source='location.name', read_only=True)
    subcategory_name = serializers.CharField(source='subcategory.name', read_only=True)
    sublocation_name = serializers.CharField(source='sublocation.name', read_only=True)

    class Meta:
        model = Product
        fields = '__all__'

    def get_images(self, obj):
        images = Image.objects.filter(object_id=obj.id)
        return ImageSerializer(images, many=True, context=self.context).data

    def validate_description(self, value):
        allowed_tags = ['table', 'tbody', 'tr', 'td', 'th', 'strong', 'b', 'i', 'u', 'p', 'br', 'span']
        allowed_attributes = {
            'td': ['style'],
            'th': ['colspan'],
            'span': ['style']
        }
        return bleach.clean(value, tags=allowed_tags, attributes=allowed_attributes)

    def create(self, validated_data):
        # Extract and clean the description
        validated_data['description'] = self.validate_description(validated_data.get('description', ''))

        # Extract categories separately
        category_ids = validated_data.pop('categories', [])

        # Create the product instance
        product = Product.objects.create(**validated_data)
        product.categories.set(category_ids)  # Assign categories correctly

        return product

    def update(self, instance, validated_data):
        if 'description' in validated_data:
            validated_data['description'] = self.validate_description(validated_data.get('description', ''))

        category_ids = validated_data.pop('categories', None)
        instance = super().update(instance, validated_data)

        if category_ids is not None:
            instance.categories.set(category_ids)

        return instance

