from rest_framework import serializers
from .models import Category
from django.contrib.contenttypes.models import ContentType

class ContentTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContentType
        fields = '__all__'

class CategorySerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()

    class Meta:
        model = Category
        fields = '__all__'

    def get_children(self, obj):
        children = obj.children.all()
        return CategorySerializer(children, many=True).data
    
    def create(self, validated_data):
        category = Category.objects.create(**validated_data)
        return category