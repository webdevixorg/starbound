from rest_framework import serializers
from .models import Category
from django.contrib.contenttypes.models import ContentType

# Serializer for Django's built-in ContentType model
class ContentTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContentType
        fields = '__all__'  # Include all fields in the serialized output

class CategorySerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField(read_only=True)

    class Meta:
        model = Category
        fields = '__all__'

    def get_children(self, obj):
        children = obj.children.all()
        return CategorySerializer(children, many=True).data

    def create(self, validated_data):
        # Remove content_type if it's accidentally passed
        validated_data.pop('content_type', None)
        return Category.objects.create(**validated_data)

    def update(self, instance, validated_data):
        # Remove content_type if it's accidentally passed
        validated_data.pop('content_type', None)
        return super().update(instance, validated_data)
