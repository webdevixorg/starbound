from rest_framework import serializers
from django.conf import settings
from django.contrib.auth.models import User
from profiles.models import Profile
from uploads.serializers import ImageSerializer
from .models import Post, AggregatedVisitorCount
from categories.models import Category
from uploads.models import Image, UserImage

import bleach
from django.utils.safestring import mark_safe

class ProfileSerializer(serializers.ModelSerializer):
    image_path = serializers.SerializerMethodField()

    class Meta:
        model = Profile
        fields = ['image_path', 'bio']

    def get_image_path(self, obj):
        """Get the image path from the UserImage model using image_id (legacy support)"""
        try:
            if obj.image_id:
                user_image = UserImage.objects.select_related().get(id=obj.image_id)
                return user_image.image_path if hasattr(user_image, 'image_path') else user_image.image_path
            return None
        except UserImage.DoesNotExist:
            return None
        except Exception as e:
            print(f"Error fetching image path for profile {obj.id}: {e}")
            return None
            
class UserSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer(read_only=True)

    class Meta:
        model = User
        fields = ['id', 'email', 'first_name', 'last_name', 'profile']

class AggregatedVisitorCountSerializer(serializers.ModelSerializer):
    class Meta:
        model = AggregatedVisitorCount
        fields = ['data']


class PostSerializer(serializers.ModelSerializer):
    aggregated_visitor_counts = AggregatedVisitorCountSerializer(required=False)
    author = UserSerializer(read_only=True, source='user')
    images = serializers.SerializerMethodField()
    categories = serializers.PrimaryKeyRelatedField(queryset=Category.objects.all(), many=True)  # Use PrimaryKeyRelatedField here
    content_type_id = serializers.IntegerField()  # Add content_type_id field
    description = serializers.CharField(required=False)  # Handle description as raw HTML

    class Meta:
        model = Post
        fields = '__all__'


    def get_images(self, obj):
        images = Image.objects.filter(object_id=obj.id)
        return ImageSerializer(images, many=True, context=self.context).data


    def to_representation(self, instance):
        representation = super().to_representation(instance)
        max_description_length = 250  

        if self.context.get('truncate', False):
            if len(representation['description']) > max_description_length:
                representation['description'] = representation['description'][:max_description_length] + '...'

        # Mark description as safe for HTML rendering
        if 'description' in representation:
            representation['description'] = mark_safe(representation['description'])

        return representation

    def validate_description(self, value):
        allowed_tags = ['table', 'tbody', 'tr', 'td', 'th', 'strong', 'b', 'i', 'u', 'p', 'br', 'span']
        allowed_attributes = {
            'td': ['style'],
            'th': ['colspan'],
            'span': ['style']
        }
        return bleach.clean(value, tags=allowed_tags, attributes=allowed_attributes)

    def create(self, validated_data):
        categories_data = validated_data.pop('categories')
        images_data = self.context['request'].FILES.getlist('images')
        aggregated_visitor_counts_data = validated_data.pop('aggregated_visitor_counts', None)
        post = Post.objects.create(**validated_data)
        post.categories.set(categories_data)

        if aggregated_visitor_counts_data:
            aggregated_visitor_counts = AggregatedVisitorCount.objects.create(post=post, **aggregated_visitor_counts_data)
            post.aggregated_visitor_counts.set([aggregated_visitor_counts])

        for image_data in images_data:
            Image.objects.create(content_object=post, image_path=image_data)

        return post


