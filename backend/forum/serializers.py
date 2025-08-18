from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Thread, Reply
from app.posts.serializers import UserSerializer  # Fixed: model -> models
from categories.serializers import CategorySerializer

User = get_user_model()


class ReplySerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    
    class Meta:
        model = Reply
        fields = ['id', 'content', 'author', 'created_at', 'is_solution']

class ThreadListSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    replies_count = serializers.ReadOnlyField()
    last_reply = ReplySerializer(read_only=True)
    
    class Meta:
        model = Thread
        fields = [
            'id', 'title', 'slug', 'author', 'category', 'created_at', 
            'views', 'replies_count', 'is_pinned', 'is_locked', 'is_solved',
            'last_reply'
        ]

class ThreadDetailSerializer(serializers.ModelSerializer):
    author = UserSerializer(read_only=True)
    category = CategorySerializer(read_only=True)
    replies_count = serializers.ReadOnlyField()
    replies = ReplySerializer(many=True, read_only=True)
    
    class Meta:
        model = Thread
        fields = [
            'id', 'title', 'slug', 'content', 'author', 'category', 
            'created_at', 'views', 'replies_count', 'is_pinned', 
            'is_locked', 'is_solved', 'replies'
        ]

class ThreadCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Thread
        fields = ['title', 'content', 'category']

class ReplyCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Reply
        fields = ['content']