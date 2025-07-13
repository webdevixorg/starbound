from rest_framework import serializers
from .models import Category
from django.contrib.contenttypes.models import ContentType

# Serializer for Django's built-in ContentType model
class ContentTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContentType
        fields = '__all__'  # Include all fields in the serialized output


# Serializer for the Category model
class CategorySerializer(serializers.ModelSerializer):
    # This will add a custom field 'children' to include nested subcategories
    children = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = '__all__'  # You could specify fields explicitly for better control

    # This method fetches and serializes all direct children of the current category
    def get_children(self, obj):
        children = obj.children.all()  # Retrieve all child categories
        return CategorySerializer(children, many=True).data  # Recursively serialize them

    # Custom create method (not strictly needed if no extra processing is required)
    def create(self, validated_data):
        # Create a new Category instance using validated input data
        category = Category.objects.create(**validated_data)
        return category
