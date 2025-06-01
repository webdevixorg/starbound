# product/views.py
from rest_framework import viewsets, generics, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from rest_framework.exceptions import NotFound
from rest_framework.views import APIView
from django.db.models import Q

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
        query_params = self.request.query_params

        order_by = query_params.get('orderBy', None)
        categories = query_params.get('categories', None)
        locations = query_params.get('locations', None)
        price_min = query_params.get('minPrice', None)
        price_max = query_params.get('maxPrice', None)
        status = query_params.get('status', None)
        search_query = query_params.get('query', None)

        if order_by and order_by.strip():
            queryset = queryset.order_by(order_by)

        if categories:
            queryset = queryset.filter(categories__id__in=categories.split(',')).distinct()

        if locations:
            location_ids = Location.objects.filter(id__in=locations.split(',')).values_list('id', flat=True)
            queryset = queryset.filter(location_id__in=location_ids)

        if price_min:
            try:
                queryset = queryset.filter(price__gte=float(price_min))
            except ValueError:
                pass

        if price_max:
            try:
                queryset = queryset.filter(price__lte=float(price_max))
            except ValueError:
                pass

        if status:
            queryset = queryset.filter(status=status)
        else:
            queryset = queryset.exclude(status='Deleted')

        if search_query:
            queryset = queryset.filter(
                Q(title__icontains=search_query) |
                Q(description__icontains=search_query)
            )

        return queryset

    @action(detail=False, methods=['get'])
    def latest(self, request):
        count = request.query_params.get('count', 5)
        try:
            count = int(count)
        except ValueError:
            count = 5

        queryset = self.get_queryset().order_by('-date')[:count]
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

    def get_object(self):
        lookup_value = self.kwargs.get('id') or self.kwargs.get('slug')
        try:
            if 'id' in self.kwargs:
                obj = self.queryset.get(id=lookup_value)
            elif 'slug' in self.kwargs:
                obj = self.queryset.get(slug=lookup_value)
            else:
                raise NotFound("No Product matches the given query.")
        except Product.DoesNotExist:
            raise NotFound(f"No Product matches the given query for id/slug: {lookup_value}")

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
            product = Product.objects.get(slug=slug)
            related_products = Product.objects.filter(categories__in=product.categories.all()) \
                .exclude(slug=slug).distinct().order_by('-date')[:4]

            serializer = ProductSerializer(related_products, many=True, context={'request': request})
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Product.DoesNotExist:
            return Response({"error": "Product not found"}, status=status.HTTP_404_NOT_FOUND)
