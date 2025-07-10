
from rest_framework import viewsets, generics, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django.db.models import Sum, IntegerField
from .models import Post
from .serializers import PostSerializer

class PostPagination(PageNumberPagination):
    page_size_query_param = 'pageSize'
    page_query_param = 'page'

class PostView(viewsets.ModelViewSet):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    pagination_class = PostPagination
    lookup_field = 'slug'

    def get_queryset(self):
        queryset = super().get_queryset()

        content_type_id = self.request.GET.get('content_type_id')
        if content_type_id:
            queryset = queryset.filter(content_type_id=content_type_id)
        
        status = self.request.GET.get('status')
        if status:
            queryset = queryset.filter(status=status)
        elif not status:
            queryset = queryset.exclude(status='Deleted')
        return queryset

    @action(detail=False, methods=['get'])
    def latest(self, request):
        count = request.GET.get('count', 10)  # Get the count parameter from the URL, default to 5 if not provided
        try:
            count = int(count)
        except ValueError:
            count = 5  # Default to 5 if the count parameter is not a valid integer

        queryset = self.get_queryset().order_by('-date')[:count]  # Limit to the latest 'count' items
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True, context={'request': request, 'truncate': True})
            return self.get_paginated_response(serializer.data)
        
        serializer = self.get_serializer(queryset, many=True, context={'request': request, 'truncate': True})
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def popular(self, request):
        queryset = self.get_queryset().annotate(
            visitor_sum=Sum('aggregated_visitor_counts__data__all_time_count', output_field=IntegerField())
        ).order_by('-visitor_sum')
        
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True, context={'request': request, 'truncate': True})
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True, context={'request': request, 'truncate': True})
        return Response(serializer.data)
    
class PostDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    lookup_field = 'slug'

    @action(detail=True, methods=['patch'])
    def change_status(self, request, slug=None):
        try:
            post = self.get_object()
            new_status = request.data.get('status')

            if new_status not in ['Deleted', 'Active', 'Published', 'Archived', 'Draft']:
                return Response({'error': 'invalid status'}, status=status.HTTP_400_BAD_REQUEST)

            post.status = new_status
            post.save()

            return Response({'status': f'post {new_status.lower()}'}, status=status.HTTP_200_OK)
        except Post.DoesNotExist:
            return Response({'error': 'post not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': 'internal server error', 'details': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
