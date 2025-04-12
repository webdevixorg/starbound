# product/views.py
from rest_framework import viewsets, generics, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status
from rest_framework.pagination import PageNumberPagination
from rest_framework.exceptions import NotFound

from rest_framework.views import APIView

from categories.models import Category
from locations.models import Location
from .models import Product
from .serializers import ProductSerializer

class ProductPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class ProductView(viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    pagination_class = ProductPagination  
    lookup_field = 'slug'  

    def get_queryset(self):
        queryset = super().get_queryset()
        order_by = self.request.query_params.get('orderBy', None)
        categories = self.request.query_params.get('categories', None)
        locations = self.request.query_params.get('locations', None)
        price_min = self.request.query_params.get('priceMin', None)
        price_max = self.request.query_params.get('priceMax', None)

        if order_by is not None:
            if order_by.strip():
                queryset = queryset.order_by(order_by)

        if categories is not None:
            queryset = queryset.filter(categories__id__in=categories.split(',')).distinct()

        if locations is not None:
            location_ids = Location.objects.filter(id__in=locations.split(',')).values_list('id', flat=True)
            queryset = queryset.filter(location_id__in=location_ids)

        if price_min is not None:
            queryset = queryset.filter(price__gte=price_min)

        if price_max is not None:
            queryset = queryset.filter(price__lte=price_max)

        status = self.request.query_params.get('status')
        if status:
            queryset = queryset.filter(status=status)
        elif not status:
            queryset = queryset.exclude(status='Deleted')
        return queryset
        
    @action(detail=False, methods=['get'])
    def latest(self, request):
        count = request.GET.get('count', 5)  # Get the count parameter from the URL, default to 5 if not provided
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


    def retrieve(self, request, *args, **kwargs):
        slug = kwargs.get('slug')
        try:
            product = Product.objects.get(slug=slug)
        except Product.DoesNotExist:
            raise NotFound(f"No Product matches the given query for slug: {slug}")
        serializer = self.get_serializer(product)
        return Response(serializer.data)
    
class ProductDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    lookup_field = 'slug'

    def get_object(self):
        queryset = self.get_queryset()
        slug = self.kwargs.get(self.lookup_field)
        try:
            obj = queryset.get(slug=slug)
        except Product.DoesNotExist:
            raise NotFound(f"No Product matches the given query for slug: {slug}")
        self.check_object_permissions(self.request, obj)
        return obj


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
        except Product.DoesNotExist:
            return Response({'error': 'post not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            return Response({'error': 'internal server error', 'details': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


    def delete(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response(status=status.HTTP_204_NO_CONTENT)

class RelatedProducts(APIView):
    def get(self, request, slug):
        try:
            # Retrieve the product with the given slug
            product = Product.objects.get(slug=slug)
            
            # Filter products that share at least one category with the given product
            related_products = Product.objects.filter(categories__in=product.categories.all()).exclude(slug=slug).distinct().order_by('-date')[:4] 
            
            # Serialize the related products data
            serializer = ProductSerializer(related_products, many=True, context={'request': request})
            
            # Return the serialized data
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Product.DoesNotExist:
            return Response({"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND)