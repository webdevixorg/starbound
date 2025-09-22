from rest_framework import viewsets, status, permissions
from rest_framework.response import Response
from rest_framework.decorators import action, api_view, permission_classes
from django.shortcuts import get_object_or_404
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from django.utils.text import slugify
from django.utils import timezone
from django.db import models
from .models import Thread, Reply, ThreadView
from categories.models import Category

from .serializers import (
    ThreadListSerializer, ThreadDetailSerializer,
    ThreadCreateSerializer, ReplySerializer, ReplyCreateSerializer
)

@method_decorator(csrf_exempt, name='dispatch')
class ThreadViewSet(viewsets.ModelViewSet):
    queryset = Thread.objects.select_related('author', 'category').prefetch_related('replies__author')
    lookup_field = 'slug'
    
    def get_queryset(self):
        queryset = Thread.objects.select_related('author', 'category').prefetch_related('replies')
        category_slug = self.request.GET.get('category', None)
        author_id = self.request.GET.get('author', None)
        my_threads = self.request.GET.get('my_threads', None)
        search = self.request.GET.get('search', None)
        
        if category_slug:
            queryset = queryset.filter(category__slug=category_slug)
        
        if author_id:
            queryset = queryset.filter(author__id=author_id)
        
        if my_threads and self.request.user.is_authenticated:
            queryset = queryset.filter(author=self.request.user)
        
        if search:
            queryset = queryset.filter(
                models.Q(title__icontains=search) | 
                models.Q(content__icontains=search)
            )
            
        return queryset.order_by('-created_at')
    
    def get_serializer_class(self):
        if self.action == 'create':
            return ThreadCreateSerializer
        elif self.action == 'retrieve':
            return ThreadDetailSerializer
        return ThreadListSerializer
    
    def get_permissions(self):
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            return [permissions.IsAuthenticated()]
        return []
    
    def perform_create(self, serializer):
        title = serializer.validated_data['title']
        slug = slugify(title)
        
        # Ensure unique slug
        original_slug = slug
        counter = 1
        while Thread.objects.filter(slug=slug).exists():
            slug = f"{original_slug}-{counter}"
            counter += 1
        
        serializer.save(author=self.request.user, slug=slug)
    
    def create(self, request, *args, **kwargs):
        """Override create to return the thread with slug in response"""
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        
        # Return the created thread with all fields including slug
        thread = serializer.instance
        response_serializer = ThreadDetailSerializer(thread)
        
        return Response(response_serializer.data, status=status.HTTP_201_CREATED)
    
    def retrieve(self, request, *args, **kwargs):
        thread = self.get_object()
        
        # Track view
        ip = self.get_client_ip(request)
        user = request.user if request.user.is_authenticated else None
        
        view_obj, created = ThreadView.objects.get_or_create(
            thread=thread,
            user=user,
            ip_address=ip,
            defaults={'viewed_at': timezone.now()}
        )
        
        if created:
            thread.views += 1
            thread.save(update_fields=['views'])
        
        return super().retrieve(request, *args, **kwargs)
    
    def get_client_ip(self, request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0]
        else:
            ip = request.META.get('REMOTE_ADDR')
        return ip
    
    @action(detail=True, methods=['post'], permission_classes=[permissions.IsAuthenticated])
    def replies(self, request, slug=None):
        """Add a reply to a thread"""
        thread = self.get_object()
        
        if thread.is_locked:
            return Response(
                {'error': 'This thread is locked and cannot accept new replies.'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        serializer = ReplyCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        reply = serializer.save(
            thread=thread,
            author=request.user
        )
        
        # Update thread's updated_at
        thread.updated_at = timezone.now()
        thread.save(update_fields=['updated_at'])
        
        return Response(
            ReplySerializer(reply).data,
            status=status.HTTP_201_CREATED
        )
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get forum statistics"""
        stats = {
            'total_threads': Thread.objects.count(),
            'total_replies': Reply.objects.count(),
            'total_categories': Category.objects.filter().count(),
        }
        return Response(stats)