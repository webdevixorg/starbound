from rest_framework import serializers
from .models import Entity

class EntitySerializer(serializers.ModelSerializer):
    children = serializers.SerializerMethodField()

    class Meta:
        model = Entity
        fields = ['id', 'name', 'slug', 'description', 'type', 'parent', 'children']

    def get_children(self, obj):
        return EntitySerializer(obj.children.all(), many=True).data
