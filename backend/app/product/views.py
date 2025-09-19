from rest_framework import viewsets, generics, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly, AllowAny
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.exceptions import PermissionDenied
from rest_framework.views import APIView
from django.db.models import Sum, IntegerField, Q
from django.shortcuts import get_object_or_404
from django.contrib.auth.models import AnonymousUser

from locations.models import Location
from .models import Product
from .serializers import ProductSerializer
import logging

logger = logging.getLogger(__name__)

class ProductPagination(PageNumberPagination):
    page_size_query_param = 'pageSize'
    page_query_param = 'page'
    max_page_size = 100
    page_size = 10

class FrontendProductView(viewsets.ReadOnlyModelViewSet):
    """
    Frontend public view for products - READ ONLY ACCESS
    Handles public product display, search, filtering
    No authentication required
    """
    serializer_class = ProductSerializer
    pagination_class = ProductPagination
    lookup_field = 'slug'
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        """
        Return only active/published products for public frontend
        """
        queryset = Product.objects.filter(
            status__in=['Active', 'published']
        ).order_by('-created_at')
        
        # Search functionality
        search = self.request.GET.get('query', '')
        if search:
            queryset = queryset.filter(
                Q(title__icontains=search) | 
                Q(description__icontains=search) |
                Q(short_description__icontains=search) | 
                Q(additional_info__icontains=search)
            )
        
        # Category filtering
        categories = self.request.GET.get('categories', '')
        if categories:
            queryset = queryset.filter(
                categories__id__in=categories.split(',')
            ).distinct()
        
        # Location filtering
        locations = self.request.GET.get('locations', '')
        if locations:
            location_ids = Location.objects.filter(
                id__in=locations.split(',')
            ).values_list('id', flat=True)
            queryset = queryset.filter(location_id__in=location_ids)
        
        # Price filtering
        price_min = self.request.GET.get('minPrice', '')
        if price_min:
            try:
                queryset = queryset.filter(price__gte=float(price_min))
            except ValueError:
                pass
        
        price_max = self.request.GET.get('maxPrice', '')
        if price_max:
            try:
                queryset = queryset.filter(price__lte=float(price_max))
            except ValueError:
                pass
        
        # Ordering
        order_by = self.request.GET.get('orderBy', '')
        if order_by:
            queryset = queryset.order_by(order_by)
        
        # Content type filtering
        content_type_id = self.request.GET.get('content_type_id', '')
        if content_type_id:
            queryset = queryset.filter(content_type_id=content_type_id)
        
        return queryset.distinct()

    @action(detail=False, methods=['get'])
    def latest(self, request):
        """
        Get latest active/published products - PUBLIC ACCESS
        """
        try:
            count = request.GET.get('count', 10)
            try:
                count = int(count)
                count = min(count, 50)  # Limit maximum count
            except ValueError:
                count = 10

            queryset = self.get_queryset()[:count]
            
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
            logger.error(f"Error fetching latest products: {e}")
            return Response(
                {'error': 'Failed to fetch latest products'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def popular(self, request):
        """
        Get popular published products - PUBLIC ACCESS
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
            logger.error(f"Error fetching popular products: {e}")
            return Response(
                {'error': 'Failed to fetch popular products'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


    @action(detail=False, methods=['get'])
    def featured(self, request):
        """
        Get featured products - PUBLIC ACCESS
        """
        from django.utils.timezone import now
        from datetime import timedelta

        recent_threshold = now() - timedelta(days=14)

        featured_products = Product.objects.filter(
            Q(is_featured=True) |
            Q(created_at__gte=recent_threshold) |
            Q(avg_rating__gte=4.5, review_count__gte=5) |
            Q(sale_price__isnull=False)
        ).order_by('-created_at')[:12]

        serializer = self.get_serializer(
            featured_products, many=True, context={'request': request}
        )
        return Response(serializer.data)


    @action(detail=False, methods=['get'])
    def by_category(self, request):
        """
        Get products by category - PUBLIC ACCESS
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
            logger.error(f"Error fetching products by category: {e}")
            return Response(
                {'error': 'Failed to fetch products by category'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def by_location(self, request):
        """
        Get products by location - PUBLIC ACCESS
        """
        try:
            location_id = request.GET.get('location_id')
            if not location_id:
                return Response(
                    {'error': 'location_id parameter is required'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            queryset = self.get_queryset().filter(location_id=location_id)
            
            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)
            
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)
            
        except Exception as e:
            logger.error(f"Error fetching products by location: {e}")
            return Response(
                {'error': 'Failed to fetch products by location'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def price_range(self, request):
        """
        Get products within price range - PUBLIC ACCESS
        """
        try:
            min_price = request.GET.get('min_price')
            max_price = request.GET.get('max_price')
            
            if not min_price and not max_price:
                return Response(
                    {'error': 'min_price or max_price parameter is required'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            queryset = self.get_queryset()
            
            if min_price:
                try:
                    queryset = queryset.filter(price__gte=float(min_price))
                except ValueError:
                    return Response(
                        {'error': 'Invalid min_price value'}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            if max_price:
                try:
                    queryset = queryset.filter(price__lte=float(max_price))
                except ValueError:
                    return Response(
                        {'error': 'Invalid max_price value'}, 
                        status=status.HTTP_400_BAD_REQUEST
                    )
            
            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)
            
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)
            
        except Exception as e:
            logger.error(f"Error fetching products by price range: {e}")
            return Response(
                {'error': 'Failed to fetch products by price range'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


class ProfileProductView(viewsets.ModelViewSet):
    """
    Profile/Dashboard view for authenticated users to manage their products
    Full CRUD access with ownership checks
    Authentication required for all operations
    """
    serializer_class = ProductSerializer
    pagination_class = ProductPagination
    lookup_field = 'slug'
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticated]

    def _check_ownership(self, product, user):
        """
        Check if the user owns the product or has staff/admin privileges
        Returns True if user can modify the product, False otherwise
        """
        if isinstance(user, AnonymousUser):
            logger.debug("Anonymous user attempted to access product ownership check")
            return False
        
        # Staff and superusers can modify any product
        if user.is_staff or user.is_superuser:
            logger.debug(f"Staff/Superuser {user.id} ({user.username}) granted access to product {product.id}")
            return True
        
        # Check regular user ownership based on your database schema
        # Your schema shows user_id field, so check that first
        try:
            if hasattr(product, 'user') and product.user:
                is_owner = product.user == user
                logger.debug(f"Ownership check via 'user' field: {is_owner} for user {user.id} on product {product.id}")
                return is_owner
            elif hasattr(product, 'user_id') and product.user_id:
                is_owner = product.user_id == user.id
                logger.debug(f"Ownership check via 'user_id' field: {is_owner} for user {user.id} on product {product.id}")
                return is_owner
            elif hasattr(product, 'author') and product.author:
                is_owner = product.author == user
                logger.debug(f"Ownership check via 'author' field: {is_owner} for user {user.id} on product {product.id}")
                return is_owner
            elif hasattr(product, 'created_by') and product.created_by:
                is_owner = product.created_by == user
                logger.debug(f"Ownership check via 'created_by' field: {is_owner} for user {user.id} on product {product.id}")
                return is_owner
            else:
                logger.warning(f"No ownership field found on product {product.id} for user {user.id}")
                return False
                
        except Exception as e:
            logger.error(f"Error checking ownership for product {product.id} and user {user.id}: {e}")
            return False
    
    def _get_user_field(self):
        """
        Determine the user field name for the Product model based on your schema
        """
        # Based on your database schema, you have user_id field
        if hasattr(Product, 'user'):
            return 'user'
        elif hasattr(Product, 'user_id'):
            return 'user'  # Django ORM uses 'user' for user_id foreign key
        elif hasattr(Product, 'author'):
            return 'author'
        elif hasattr(Product, 'created_by'):
            return 'created_by'
        else:
            return 'user'  # fallback - this should work with your schema

    def get_queryset(self):
        """
        Return user's products with optional status filtering
        """
        user = self.request.user
        status_filter = self.request.GET.get("status")
        
        if not user.is_authenticated:
            return Product.objects.none()
        
        user_field = self._get_user_field()
        
        if user.is_staff:
            # Staff users can see all products
            queryset = Product.objects.all()
        else:
            # Regular users see only their own products
            queryset = Product.objects.filter(**{user_field: user})
        
        # Apply status filter if provided
        if status_filter:
            # Normalize status case
            status_mapping = {
                'published': 'Published',
                'active': 'Active',
                'draft': 'Draft', 
                'deleted': 'Deleted',
                'archived': 'Archived'
            }
            normalized_status = status_mapping.get(status_filter.lower(), status_filter.title())
            queryset = queryset.filter(status=normalized_status)
        
        return queryset.order_by('-created_at')

    def get_object(self):
        """
        Override to handle both slug and id lookups
        """
        queryset = self.filter_queryset(self.get_queryset())
        
        # Check if we're using ID lookup (from URL parameter)
        if 'id' in self.kwargs:
            # ID-based lookup
            filter_kwargs = {'id': self.kwargs['id']}
        elif self.lookup_field in self.kwargs:
            # Slug-based lookup  
            filter_kwargs = {self.lookup_field: self.kwargs[self.lookup_field]}
        else:
            raise AttributeError("No valid lookup parameter found")

        try:
            obj = queryset.get(**filter_kwargs)
        except Product.DoesNotExist:
            from django.http import Http404
            raise Http404("Product not found")
        
        # May raise a permission denied
        self.check_object_permissions(self.request, obj)
        
        return obj

    def create(self, request, *args, **kwargs):
        """
        Create a new product - AUTHENTICATED ONLY
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
                product = serializer.save()
                logger.info(f"User {request.user.id} created product {product.id}")
                return Response(serializer.data, status=status.HTTP_201_CREATED)
            
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            logger.error(f"Error creating product: {e}")
            return Response(
                {'error': 'Failed to create product', 'details': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def update(self, request, *args, **kwargs):
        """
        Update a product - AUTHENTICATED ONLY + OWNERSHIP CHECK
        """
        try:
            product = self.get_object()
            
            # Check ownership
            if not self._check_ownership(product, request.user):
                logger.warning(f"User {request.user.id} attempted to update product {product.id} without permission")
                return Response(
                    {'error': 'Permission denied. You can only update your own products.'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            partial = kwargs.pop('partial', False)
            serializer = self.get_serializer(product, data=request.data, partial=partial)
            
            if serializer.is_valid():
                updated_product = serializer.save()
                logger.info(f"User {request.user.id} updated product {product.id}")
                return Response(serializer.data)
            
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
            
        except Exception as e:
            logger.error(f"Error updating product: {e}")
            return Response(
                {'error': 'Failed to update product', 'details': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def destroy(self, request, *args, **kwargs):
        """
        Soft delete (move to trash) - AUTHENTICATED ONLY + OWNERSHIP CHECK
        """
        try:
            product = self.get_object()
            
            # Check ownership
            if not self._check_ownership(product, request.user):
                logger.warning(f"User {request.user.id} attempted to delete product {product.id} without permission")
                return Response(
                    {'error': 'Permission denied. You can only delete your own products.'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Soft delete - move to trash
            old_status = product.status
            product.status = 'Deleted'
            product.save()
            
            logger.info(f"User {request.user.id} moved product {product.id} to trash (was {old_status})")
            
            return Response({
                'message': 'Product moved to trash successfully',
                'previous_status': old_status
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error moving product to trash: {e}")
            return Response(
                {'error': 'Failed to move product to trash', 'details': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['patch'])
    def change_status(self, request, slug=None):
        """
        Change product status - AUTHENTICATED ONLY + OWNERSHIP CHECK
        """
        try:
            product = self.get_object()
            
            # Check ownership
            if not self._check_ownership(product, request.user):
                logger.warning(f"User {request.user.id} attempted to change status of product {product.id} without permission")
                return Response(
                    {'error': 'Permission denied. You can only modify your own products.'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            new_status = request.data.get('status')
            valid_statuses = ['Deleted', 'Active', 'Published', 'Archived', 'Draft']
            
            if new_status not in valid_statuses:
                return Response(
                    {'error': f'Invalid status. Valid options: {valid_statuses}'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )

            old_status = product.status
            product.status = new_status
            product.save()
            
            logger.info(f"User {request.user.id} changed product {product.id} status from {old_status} to {new_status}")

            return Response({
                'message': f'Product status changed to {new_status.lower()}',
                'old_status': old_status,
                'new_status': new_status
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error changing product status: {e}")
            return Response(
                {'error': 'Internal server error', 'details': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['delete'])
    def permanent_delete(self, request, slug=None):
        """
        Permanently delete a product - AUTHENTICATED ONLY + OWNERSHIP CHECK
        Only works on products that are already in trash (Deleted status)
        """
        try:
            product = self.get_object()
            
            # Check ownership
            if not self._check_ownership(product, request.user):
                logger.warning(f"User {request.user.id} attempted to permanently delete product {product.id} without permission")
                return Response(
                    {'error': 'Permission denied. You can only delete your own products.'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Only allow permanent deletion of trashed products
            if product.status != 'Deleted':
                return Response(
                    {'error': 'Can only permanently delete products that are in trash. Move to trash first.'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            product_id = product.id
            product_title = product.title
            product.delete()  # Hard delete from database
            
            logger.info(f"User {request.user.id} permanently deleted product {product_id} ({product_title})")
            
            return Response(
                {'message': 'Product permanently deleted successfully'}, 
                status=status.HTTP_204_NO_CONTENT
            )
            
        except Exception as e:
            logger.error(f"Error permanently deleting product: {e}")
            return Response(
                {'error': 'Failed to permanently delete product', 'details': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=True, methods=['patch'])
    def restore(self, request, slug=None):
        """
        Restore product from trash - AUTHENTICATED ONLY + OWNERSHIP CHECK
        """
        try:
            product = self.get_object()
            
            # Check ownership
            if not self._check_ownership(product, request.user):
                logger.warning(f"User {request.user.id} attempted to restore product {product.id} without permission")
                return Response(
                    {'error': 'Permission denied. You can only restore your own products.'}, 
                    status=status.HTTP_403_FORBIDDEN
                )
            
            # Only allow restoration of deleted products
            if product.status != 'Deleted':
                return Response(
                    {'error': 'Can only restore products that are in trash'}, 
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
            
            product.status = target_status
            product.save()
            
            logger.info(f"User {request.user.id} restored product {product.id} to {target_status}")
            
            return Response({
                'message': f'Product restored to {target_status.lower()} successfully',
                'previous_status': 'Deleted',
                'current_status': target_status
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            logger.error(f"Error restoring product: {e}")
            return Response(
                {'error': 'Failed to restore product', 'details': str(e)}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def drafts(self, request):
        """
        Get user's draft products - AUTHENTICATED ONLY
        """
        try:
            user_field = self._get_user_field()
            queryset = Product.objects.filter(
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
            logger.error(f"Error fetching draft products: {e}")
            return Response(
                {'error': 'Failed to fetch draft products'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def published(self, request):
        """
        Get user's published/active products - AUTHENTICATED ONLY
        """
        try:
            user_field = self._get_user_field()
            queryset = Product.objects.filter(
                **{user_field: request.user}, 
                status__in=['Published', 'Active']
            ).order_by('-created_at')
            
            page = self.paginate_queryset(queryset)
            if page is not None:
                serializer = self.get_serializer(page, many=True)
                return self.get_paginated_response(serializer.data)
            
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data)
            
        except Exception as e:
            logger.error(f"Error fetching published products: {e}")
            return Response(
                {'error': 'Failed to fetch published products'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['get'])
    def trash(self, request):
        """
        Get user's trashed products - AUTHENTICATED ONLY
        """
        try:
            user_field = self._get_user_field()
            queryset = Product.objects.filter(
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
            logger.error(f"Error fetching trashed products: {e}")
            return Response(
                {'error': 'Failed to fetch trashed products'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    @action(detail=False, methods=['delete'])
    def empty_trash(self, request):
        """
        Permanently delete all trashed products - AUTHENTICATED ONLY
        """
        try:
            user_field = self._get_user_field()
            trashed_products = Product.objects.filter(
                **{user_field: request.user}, 
                status='Deleted'
            )
            
            count = trashed_products.count()
            if count == 0:
                return Response(
                    {'message': 'Trash is already empty'}, 
                    status=status.HTTP_200_OK
                )
            
            # Confirm deletion with query parameter
            confirm = request.GET.get('confirm', '').lower()
            if confirm != 'true':
                return Response({
                    'message': f'Found {count} products in trash. Add ?confirm=true to permanently delete all.',
                    'count': count,
                    'warning': 'This action cannot be undone!'
                }, status=status.HTTP_200_OK)
            
            trashed_products.delete()
            
            logger.info(f"User {request.user.id} emptied trash - deleted {count} products permanently")
            
            return Response({
                'message': f'Successfully deleted {count} products permanently',
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
        Get user's product statistics - AUTHENTICATED ONLY
        """
        try:
            user_field = self._get_user_field()
            user_products = Product.objects.filter(**{user_field: request.user})
            
            stats = {
                'total': user_products.count(),
                'published': user_products.filter(status='Published').count(),
                'active': user_products.filter(status='Active').count(),
                'drafts': user_products.filter(status='Draft').count(),
                'archived': user_products.filter(status='Archived').count(),
                'trashed': user_products.filter(status='Deleted').count(),
            }
            
            return Response(stats)
            
        except Exception as e:
            logger.error(f"Error fetching product stats: {e}")
            return Response(
                {'error': 'Failed to fetch product statistics'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )



class ProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Single product detail view - handles both public and authenticated access
    """
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    lookup_field = 'id'
    authentication_classes = [JWTAuthentication]
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get_queryset(self):
        """
        Filter based on authentication status
        """
        if self.request.user.is_authenticated:
            # Authenticated users can see their own products in any status + published products
            user_field = 'author' if hasattr(Product, 'author') else 'user'
            return Product.objects.filter(
                Q(**{user_field: self.request.user}) | Q(status__in=['published', 'draft'])
            )
        else:
            # Anonymous users only see published products
            return Product.objects.filter(status__in=['published'])

    def get_object(self):
        """
        Override to add ownership check for update/delete operations
        """
        obj = super().get_object()
        
        # For update/delete operations, check ownership
        if self.request.method in ['PUT', 'PATCH', 'DELETE']:
            if not self.request.user.is_authenticated:
                raise PermissionDenied("Authentication required")
            
            # Check ownership
            if hasattr(obj, 'user') and obj.user != self.request.user:
                if hasattr(obj, 'author') and obj.author != self.request.user:
                    if not (self.request.user.is_staff or self.request.user.is_superuser):
                        raise PermissionDenied("You can only modify your own products")
        
        return obj


class RelatedProducts(APIView):
    """
    Get related products based on categories - PUBLIC ACCESS
    """
    permission_classes = [AllowAny]
    
    def get(self, request, slug):
        try:
            product = Product.objects.get(
                slug=slug, 
                status__in=['Published', 'Active']
            )
            
            related_products = Product.objects.filter(
                categories__in=product.categories.all(),
                status__in=['Published', 'Active']
            ).exclude(slug=slug).distinct().order_by('-created_at')[:4]

            serializer = ProductSerializer(
                related_products, 
                many=True, 
                context={'request': request}
            )
            return Response(serializer.data, status=status.HTTP_200_OK)
            
        except Product.DoesNotExist:
            return Response(
                {"error": "Product not found"}, 
                status=status.HTTP_404_NOT_FOUND
            )
        except Exception as e:
            logger.error(f"Error fetching related products: {e}")
            return Response(
                {"error": "Failed to fetch related products"}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )