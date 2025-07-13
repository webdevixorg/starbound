from rest_framework import viewsets, generics, status
from rest_framework.views import APIView
from rest_framework.exceptions import NotFound
from rest_framework.response import Response
from django.contrib.contenttypes.models import ContentType

from .models import Category
from .serializers import CategorySerializer, ContentTypeSerializer

# API endpoint to list all content types (no pagination)
class ContentTypeList(generics.ListAPIView):
    queryset = ContentType.objects.all()
    pagination_class = None  # Disable pagination
    serializer_class = ContentTypeSerializer

# ViewSet for Category model providing standard CRUD operations
class CategoryView(viewsets.ModelViewSet):
    serializer_class = CategorySerializer
    pagination_class = None  # Disable pagination
    lookup_field = 'slug'    # Use 'slug' field in URL lookups by default

    def get_queryset(self):
        # Optional filter to only get root categories (parent is null)
        # Optionally filter by content_type_id query parameter
        content_type_id = self.request.query_params.get('content_type_id')
        queryset = Category.objects.filter(parent__isnull=True)
        if content_type_id:
            queryset = queryset.filter(content_type_id=content_type_id)
        return queryset

    def get_object(self):
        # Custom object retrieval logic to support lookup by slug or id,
        # also checking if content_type_id matches if provided
        lookup_value = self.kwargs.get(self.lookup_field)
        content_type_id = self.request.query_params.get('content_type_id')

        if lookup_value is None:
            raise NotFound("No slug or id provided.")

        try:
            # Try to get category by slug first
            category = Category.objects.get(slug=lookup_value)
            # If content_type_id is specified, ensure it matches
            if content_type_id and category.content_type_id != int(content_type_id):
                raise Category.DoesNotExist
            return category
        except Category.DoesNotExist:
            try:
                # If not found by slug, try by id
                category = Category.objects.get(id=lookup_value)
                if content_type_id and category.content_type_id != int(content_type_id):
                    raise Category.DoesNotExist
                return category
            except Category.DoesNotExist:
                # If still not found, raise 404 error
                raise NotFound(f"Category with slug or id '{lookup_value}' not found.")

    # Save content_type when creating a category (unindent these methods)
    def perform_create(self, serializer):
        self._set_content_type_and_save(serializer)

    # Save content_type when updating a category
    def perform_update(self, serializer):
        self._set_content_type_and_save(serializer)

    # Helper method to set content_type and save the serializer
    def _set_content_type_and_save(self, serializer):
        content_type = ContentType.objects.get_for_model(Category)
        serializer.save(content_type=content_type)

    # Custom delete method returning a JSON response on success
    def delete(self, request, *args, **kwargs):
        instance = self.get_object()
        self.perform_destroy(instance)
        return Response({"detail": "Category deleted successfully."}, status=status.HTTP_204_NO_CONTENT)

# APIView to get list of subcategories for a given parent category id
class CategoryListByParent(APIView):
    def get(self, request, parent_id):
        categories = Category.objects.filter(parent_id=parent_id)
        serializer = CategorySerializer(categories, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
