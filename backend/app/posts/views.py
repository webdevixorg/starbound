from rest_framework import viewsets, generics, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly, AllowAny
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import PermissionDenied, NotFound
from django.db.models import Sum, IntegerField, Q
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import AnonymousUser
from .models import Post
from .serializers import PostSerializer
import logging

logger = logging.getLogger(__name__)

class PostPagination(PageNumberPagination):
    page_size_query_param = 'pageSize'
    page_query_param = 'page'
    max_page_size = 100
    page_size = 10

class FrontendPostView(viewsets.ReadOnlyModelViewSet):
    """
    Frontend public view for posts - READ ONLY ACCESS
    Handles public post display, search, filtering
    No authentication required
    """
    serializer_class = PostSerializer
    pagination_class = PostPagination
    lookup_field = 'slug'
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        """
        Return only published posts for public frontend
        """
        queryset = Post.objects.filter(status='published').order_by('-created_at')
        
        # Search functionality
        search = self.request.GET.get('query', '')
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | 
                Q(slug__icontains=search) |
                Q(description__icontains=search)
            )
        
        # Category filtering - subcategory takes priority
        category = self.request.GET.get('category', '')
        subcategory = self.request.GET.get('subcategory', '')
        
        if subcategory:
            # If subcategory is present, ignore category and filter only by subcategory
            if subcategory.isdigit():
                # If it's a number, filter by ID
                queryset = queryset.filter(categories__id=subcategory)
            else:
                # If it's text, filter by slug
                queryset = queryset.filter(categories__slug=subcategory)
        elif category:
            # Only apply category filter if no subcategory is present
            if category.isdigit():
                # If it's a number, filter by ID
                queryset = queryset.filter(categories__id=category)
            else:
                # If it's text, filter by slug
                queryset = queryset.filter(categories__slug=category)
        
        # Content type filtering
        content_type_id = self.request.GET.get('content_type_id', '')
        if content_type_id:
            queryset = queryset.filter(content_type_id=content_type_id)
        
        return queryset.distinct()


    @action(detail=False, methods=['get'])
    def latest(self, request):
        """
        Get latest published posts - PUBLIC ACCESS
        Properly paginated without pre-limiting the queryset
        """
        try:
            # Get the full queryset (already ordered by -created_at in get_queryset)
            queryset = self.get_queryset()
            
            # Use Django REST framework pagination
            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = self.get_serializer(
                    page, many=True, 
                    context={'request': request, 'truncate': True}
                )
                return self.get_paginated_response(serializer.data)
            
            # Fallback if pagination is not used (shouldn't happen with our setup)
            serializer = self.get_serializer(
                queryset[:50], many=True,  # Fallback limit to prevent huge responses
                context={'request': request, 'truncate': True}
            )
            return Response(serializer.data)
            
        except Exception as e:
            logger.error(f"Error fetching latest posts: {e}")
            return Response(
                {'error': 'Failed to fetch latest posts'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def popular(self, request):
        """
        Get popular published posts - PUBLIC ACCESS
        """
        try:
            queryset = self.get_queryset().annotate(
                visitor_sum=Sum('aggregated_visitor_counts__data__all_time_count', output_field=IntegerField())
            ).order_by('-visitor_sum')
            
            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = self.get_serializer(
                    page, many=True, 
                    context={'request': request, 'truncate': True}
                )
                return self.get_paginated_response(serializer.data)
            
            serializer = self.get_serializer(
                queryset, many=True, 
                context={'request': request, 'truncate': True}
            )
            return Response(serializer.data)
            
        except Exception as e:
            logger.error(f"Error fetching popular posts: {e}")
            return Response(
                {'error': 'Failed to fetch popular posts'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def featured(self, request):
        """
        Get featured posts - PUBLIC ACCESS
        Properly paginated
        """
        try:
            queryset = self.get_queryset().filter(is_featured=True)
            
            # Use Django REST framework pagination
            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = self.get_serializer(
                    page, many=True, 
                    context={'request': request, 'truncate': True}
                )
                return self.get_paginated_response(serializer.data)
            
            # Fallback for direct response (shouldn't happen with our pagination setup)
            serializer = self.get_serializer(
                queryset, many=True, 
                context={'request': request, 'truncate': True}
            )
            return Response(serializer.data)
            
        except Exception as e:
            logger.error(f"Error fetching featured posts: {e}")
            return Response(
                {'error': 'Failed to fetch featured posts'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def by_category(self, request):
        """
        Get posts by category - PUBLIC ACCESS
        """
        try:
            category_id = request.GET.get('category_id')
            if not category_id:
                return Response(
                    {'error': 'category_id parameter is required'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            queryset = self.get_queryset().filter(categories__id=category_id)
            
            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)
            
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)
            
        except Exception as e:
            logger.error(f"Error fetching posts by category: {e}")
            return Response(
                {'error': 'Failed to fetch posts by category'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ProfilePostView(viewsets.ModelViewSet):
    """
    Profile/Dashboard view for authenticated users to manage their posts
    Full CRUD access with ownership checks
    Authentication required for all operations
    """
    serializer_class = PostSerializer
    pagination_class = PostPagination
    lookup_field = 'slug'
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def _check_ownership(self, post, user):
        """
        Check if the user owns the post or has staff/admin privileges
        Returns True if user can modify the post, False otherwise
        """
        if isinstance(user, AnonymousUser):
            logger.debug("Anonymous user attempted to access post ownership check")
            return False
        
        # Staff and superusers can modify any post
        if user.is_staff or user.is_superuser:
            logger.debug(f"Staff/Superuser {user.id} ({user.username}) granted access to post {post.id}")
            return True
        
        # Check regular user ownership based on your database schema
        try:
            if hasattr(post, 'user') and post.user:
                is_owner = post.user == user
                logger.debug(f"Ownership check via 'user' field: {is_owner} for user {user.id} on post {post.id}")
                return is_owner
            elif hasattr(post, 'user_id') and post.user_id:
                is_owner = post.user_id == user.id
                logger.debug(f"Ownership check via 'user_id' field: {is_owner} for user {user.id} on post {post.id}")
                return is_owner
            elif hasattr(post, 'author') and post.author:
                is_owner = post.author == user
                logger.debug(f"Ownership check via 'author' field: {is_owner} for user {user.id} on post {post.id}")
                return is_owner
            elif hasattr(post, 'created_by') and post.created_by:
                is_owner = post.created_by == user
                logger.debug(f"Ownership check via 'created_by' field: {is_owner} for user {user.id} on post {post.id}")
                return is_owner
            else:
                logger.warning(f"No ownership field found on post {post.id} for user {user.id}")
                return False
                
        except Exception as e:
            logger.error(f"Error checking ownership for post {post.id} and user {user.id}: {e}")
            return False
    
    def _get_user_field(self):
        """
        Determine the user field name for the Post model based on your schema
        """
        # Based on your database schema, check which field exists
        if hasattr(Post, 'user'):
            return 'user'
        elif hasattr(Post, 'user_id'):
            return 'user'  # Django ORM uses 'user' for user_id foreign key
        elif hasattr(Post, 'author'):
            return 'author'
        elif hasattr(Post, 'created_by'):
            return 'created_by'
        else:
            return 'user'  # fallback

    def get_queryset(self):
        """
        Return user's posts with optional status filtering
        """
        user = self.request.user
        status_filter = self.request.GET.get("status")
        
        if not user.is_authenticated:
            return Post.objects.none()
        
        if user.is_staff or user.is_superuser:
            # Staff and admin users can see all posts with any status
            queryset = Post.objects.all()
        else:
            # Regular users see only their own posts
            user_field = self._get_user_field()
            queryset = Post.objects.filter(**{user_field: user})
        
        # Apply status filter if provided (only for regular users, staff/admin see all statuses)
        if status_filter and not (user.is_staff or user.is_superuser):
            status_mapping = {
                'published': 'Published',
                'draft': 'Draft', 
                'deleted': 'Deleted',
                'archived': 'Archived',
            }
            normalized_status = status_mapping.get(status_filter.lower(), status_filter.title())
            queryset = queryset.filter(status=normalized_status)
        elif status_filter and (user.is_staff or user.is_superuser):
            # Staff/admin can still filter by status if they want to
            status_mapping = {
                'published': 'Published',
                'draft': 'Draft', 
                'deleted': 'Deleted',
                'archived': 'Archived',
            }
            normalized_status = status_mapping.get(status_filter.lower(), status_filter.title())
            queryset = queryset.filter(status=normalized_status)
        
        return queryset.order_by('-created_at')

    def create(self, request, *args, **kwargs):
        """
        Create a new post - AUTHENTICATED ONLY
        """
        try:
            # Set the user field automatically
            mutable_data = request.data.copy()
            user_field = self._get_user_field()
            mutable_data[user_field] = request.user.id
            
            # Set default status if not provided
            if 'status' not in mutable_data:
                mutable_data['status'] = 'Draft'
            
            serializer = self.get_serializer(data=mutable_data)
            if serializer.is_valid():
                post = serializer.save()
                logger.info(f"User {request.user.id} created post {post.id}")
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            logger.error(f"Error creating post: {e}")
            return Response(
                {'error': 'Failed to create post', 'details': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def upcreated_at(self, request, *args, **kwargs):
        """
        Upcreated_at a post - AUTHENTICATED ONLY + OWNERSHIP CHECK
        """
        try:
            post = self.get_object()
            
            # Check ownership
            if not self._check_ownership(post, request.user):
                logger.warning(f"User {request.user.id} attempted to upcreated_at post {post.id} without permission")
                return Response(
                    {'error': 'Permission denied. You can only upcreated_at your own posts.'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            partial = kwargs.pop('partial', False)
            serializer = self.get_serializer(post, data=request.data, partial=partial)
            
            if serializer.is_valid():
                upcreated_atd_post = serializer.save()
                logger.info(f"User {request.user.id} upcreated_atd post {post.id}")
                return Response(serializer.data)
            
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            logger.error(f"Error updating post: {e}")
            return Response(
                {'error': 'Failed to upcreated_at post', 'details': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def destroy(self, request, *args, **kwargs):
        """
        Soft delete (move to trash) - AUTHENTICATED ONLY + OWNERSHIP CHECK
        """
        try:
            post = self.get_object()
            
            # Check ownership
            if not self._check_ownership(post, request.user):
                logger.warning(f"User {request.user.id} attempted to delete post {post.id} without permission")
                return Response(
                    {'error': 'Permission denied. You can only delete your own posts.'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Soft delete - move to trash
            old_status = post.status
            post.status = 'Deleted'
            post.save()
            
            logger.info(f"User {request.user.id} moved post {post.id} to trash (was {old_status})")
            
            return Response({
                'message': 'Post moved to trash successfully',
                'previous_status': old_status
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error moving post to trash: {e}")
            return Response(
                {'error': 'Failed to move post to trash', 'details': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['patch'])
    def change_status(self, request, slug=None):
        """
        Change post status - AUTHENTICATED ONLY + OWNERSHIP CHECK
        """
        try:
            post = self.get_object()
            
            # Check ownership
            if not self._check_ownership(post, request.user):
                logger.warning(f"User {request.user.id} attempted to change status of post {post.id} without permission")
                return Response(
                    {'error': 'Permission denied. You can only modify your own posts.'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            new_status = request.data.get('status')
            valid_statuses = ['Deleted', 'Active', 'Published', 'Archived', 'Draft']
            
            if new_status not in valid_statuses:
                return Response(
                    {'error': f'Invalid status. Valid options: {valid_statuses}'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            old_status = post.status
            post.status = new_status
            post.save()
            
            logger.info(f"User {request.user.id} changed post {post.id} status from {old_status} to {new_status}")

            return Response({
                'message': f'Post status changed to {new_status.lower()}',
                'old_status': old_status,
                'new_status': new_status
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error changing post status: {e}")
            return Response(
                {'error': 'Internal server error', 'details': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['delete'])
    def permanent_delete(self, request, slug=None):
        """
        Permanently delete a post - AUTHENTICATED ONLY + OWNERSHIP CHECK
        Only works on posts that are already in trash (Deleted status)
        """
        try:
            post = self.get_object()
            
            # Check ownership
            if not self._check_ownership(post, request.user):
                logger.warning(f"User {request.user.id} attempted to permanently delete post {post.id} without permission")
                return Response(
                    {'error': 'Permission denied. You can only delete your own posts.'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Only allow permanent deletion of trashed posts
            if post.status != 'deleted':
                return Response(
                    {'error': 'Can only permanently delete posts that are in trash. Move to trash first.'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            post_id = post.id
            post_title = post.title
            post.delete()  # Hard delete from database
            
            logger.info(f"User {request.user.id} permanently deleted post {post_id} ({post_title})")
            
            return Response(
                {'message': 'Post permanently deleted successfully'}, 
                status=status.HTTP_204_NO_CONTENT
            )
            
        except Exception as e:
            logger.error(f"Error permanently deleting post: {e}")
            return Response(
                {'error': 'Failed to permanently delete post', 'details': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['patch'])
    def restore(self, request, slug=None):
        """
        Restore post from trash - AUTHENTICATED ONLY + OWNERSHIP CHECK
        """
        try:
            post = self.get_object()
            
            # Check ownership
            if not self._check_ownership(post, request.user):
                logger.warning(f"User {request.user.id} attempted to restore post {post.id} without permission")
                return Response(
                    {'error': 'Permission denied. You can only restore your own posts.'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Only allow restoration of deleted posts
            if post.status != 'Deleted':
                return Response(
                    {'error': 'Can only restore posts that are in trash'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Get target status from request, default to Draft
            target_status = request.data.get('status', 'Draft')
            valid_restore_statuses = ['Draft', 'Published', 'Active']
            
            if target_status not in valid_restore_statuses:
                return Response(
                    {'error': f'Invalid restore status. Valid options: {valid_restore_statuses}'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            post.status = target_status
            post.save()
            
            logger.info(f"User {request.user.id} restored post {post.id} to {target_status}")
            
            return Response({
                'message': f'Post restored to {target_status.lower()} successfully',
                'previous_status': 'Deleted',
                'current_status': target_status
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error restoring post: {e}")
            return Response(
                {'error': 'Failed to restore post', 'details': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def by_status(self, request):
        """
        Get user's posts by status - AUTHENTICATED ONLY
        Usage: /api/posts/p/by_status/?status=published OR ?status=deleted
        """
        try:
            status_param = request.GET.get('status', '').lower()
            
            # Define status mappings
            status_mappings = {
                'published': ['Published', 'Active'],
                'deleted': ['Deleted'],
                'draft': ['Draft'],
                'archived': ['Archived']
            }
            
            if status_param not in status_mappings:
                return Response({
                    'error': f'Invalid status parameter. Valid options: {list(status_mappings.keys())}'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            user_field = self._get_user_field()
            status_values = status_mappings[status_param]
            
            if len(status_values) == 1:
                queryset = Post.objects.filter(
                    **{user_field: request.user},
                    status=status_values[0]
                ).order_by('-created_at')
            else:
                queryset = Post.objects.filter(
                    **{user_field: request.user},
                    status__in=status_values
                ).order_by('-created_at')
            
            # Apply pagination
            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)
            
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)
            
        except Exception as e:
            logger.error(f"Error fetching posts by status '{status_param}': {e}")
            return Response(
                {'error': f'Failed to fetch {status_param} posts'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def drafts(self, request):
        """
        Get user's draft posts - AUTHENTICATED ONLY
        """
        try:
            user_field = self._get_user_field()
            queryset = Post.objects.filter(
                **{user_field: request.user}, 
                status='Draft'
            ).order_by('-created_at')
            
            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)
            
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)
            
        except Exception as e:
            logger.error(f"Error fetching draft posts: {e}")
            return Response(
                {'error': 'Failed to fetch draft posts'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def published(self, request):
        """
        Get user's published posts - AUTHENTICATED ONLY
        """
        try:
            user_field = self._get_user_field()
            queryset = Post.objects.filter(
                **{user_field: request.user}, 
                status='Published'
            ).order_by('-created_at')
            
            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)
            
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)
            
        except Exception as e:
            logger.error(f"Error fetching published posts: {e}")
            return Response(
                {'error': 'Failed to fetch published posts'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def trash(self, request):
        """
        Get user's trashed posts - AUTHENTICATED ONLY
        """
        try:
            user_field = self._get_user_field()
            queryset = Post.objects.filter(
                **{user_field: request.user}, 
                status='Deleted'
            ).order_by('-created_at')
            
            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)
            
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)
            
        except Exception as e:
            logger.error(f"Error fetching trashed posts: {e}")
            return Response(
                {'error': 'Failed to fetch trashed posts'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['delete'])
    def empty_trash(self, request):
        """
        Permanently delete all trashed posts - AUTHENTICATED ONLY
        """
        try:
            user_field = self._get_user_field()
            trashed_posts = Post.objects.filter(
                **{user_field: request.user}, 
                status='Deleted'
            )
            
            count = trashed_posts.count()
            if count == 0:
                return Response(
                    {'message': 'Trash is already empty'}, 
                    status=status.HTTP_200_OK
                )
            
            # Confirm deletion with query parameter
            confirm = request.GET.get('confirm', '').lower()
            if confirm != 'true':
                return Response({
                    'message': f'Found {count} posts in trash. Add ?confirm=true to permanently delete all.',
                    'count': count,
                    'warning': 'This action cannot be undone!'
                }, status=status.HTTP_200_OK)
            
            trashed_posts.delete()
            
            logger.info(f"User {request.user.id} emptied trash - deleted {count} posts permanently")
            
            return Response({
                'message': f'Successfully deleted {count} posts permanently',
                'count': count
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error emptying trash: {e}")
            return Response(
                {'error': 'Failed to empty trash', 'details': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def stats(self, request):
        """
        Get user's post statistics - AUTHENTICATED ONLY
        """
        try:
            user_field = self._get_user_field()
            user_posts = Post.objects.filter(**{user_field: request.user})
            
            stats = {
                'total': user_posts.count(),
                'published': user_posts.filter(status='Published').count(),
                'drafts': user_posts.filter(status='Draft').count(),
                'archived': user_posts.filter(status='Archived').count(),
                'trashed': user_posts.filter(status='Deleted').count(),
            }
            
            return Response(stats)
            
        except Exception as e:
            logger.error(f"Error fetching post stats: {e}")
            return Response(
                {'error': 'Failed to fetch post statistics'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

class PostDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Single post detail view - handles both public and authenticated access
    """
    queryset = Post.objects.all()
    serializer_class = PostSerializer
    lookup_field = 'slug'
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        """
        Filter based on authentication status
        """
        if self.request.user.is_authenticated:
            # Authenticated users can see their own posts in any status + published posts
            user_field = 'author' if hasattr(Post, 'author') else 'user'
            return Post.objects.filter(
                Q(**{user_field: self.request.user}) | Q(status='Published')
            )
        else:
            # Anonymous users only see published posts
            return Post.objects.filter(status='Published')

    def get_object(self):
        """
        Override to add ownership check for upcreated_at/delete operations
        """
        obj = super().get_object()
        
        # For upcreated_at/delete operations, check ownership
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            if not self.request.user.is_authenticated:
                raise PermissionDenied("Authentication required")
            
            # Check ownership
            if hasattr(obj, 'user') and obj.user != self.request.user:
                if hasattr(obj, 'author') and obj.author != self.request.user:
                    if not (self.request.user.is_staff or self.request.user.is_superuser):
                        raise PermissionDenied("You can only modify your own posts")
        
        return obj