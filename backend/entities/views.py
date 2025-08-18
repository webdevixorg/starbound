from rest_framework import viewsets
from django.db.models import Q
from .models import Entity
from .serializers import EntitySerializer
import logging

logger = logging.getLogger(__name__)

class EntityViewSet(viewsets.ModelViewSet):
    queryset = Entity.objects.all().order_by('name')
    serializer_class = EntitySerializer

    def get_queryset(self):
        """
        Optional filtering by type, parent, and search.
        Examples:
        /api/entities/?type=brand
        /api/entities/?parent=3
        /api/entities/?search=toyota
        
        /api/entities/?parent__slug=toyota&type=model
        """
        queryset = super().get_queryset()
        
        # Debug logging
        logger.info(f"Query params: {dict(self.request.query_params)}")
        
        # Filter by entity type
        entity_type = self.request.query_params.get('type')
        if entity_type:
            queryset = queryset.filter(type=entity_type)
            logger.info(f"Filtered by type '{entity_type}': {queryset.count()} results")
        
        # Filter by parent ID
        slug = self.request.query_params.get('slug')
        if slug:
            queryset = queryset.filter(slug=slug)
            logger.info(f"Filtered by slug '{slug}': {queryset.count()} results")

        # Filter by parent ID
        parent_id = self.request.query_params.get('parent')
        if parent_id:
            queryset = queryset.filter(parent_id=parent_id)
            logger.info(f"Filtered by parent_id '{parent_id}': {queryset.count()} results")
        
        # Filter by parent slug (more user-friendly)
        parent_slug = self.request.query_params.get('parent__slug')
        if parent_slug:
            try:
                # Method 1: Direct relationship lookup
                queryset = queryset.filter(parent__slug=parent_slug)
                logger.info(f"Filtered by parent__slug '{parent_slug}': {queryset.count()} results")
            except Exception as e:
                logger.error(f"Error filtering by parent__slug: {e}")
                # Fallback: Manual lookup
                try:
                    parent_entity = Entity.objects.get(slug=parent_slug, type='brand')
                    queryset = queryset.filter(parent_id=parent_entity.id)
                    logger.info(f"Fallback: Found parent '{parent_slug}' with ID {parent_entity.id}: {queryset.count()} results")
                except Entity.DoesNotExist:
                    logger.warning(f"Parent entity with slug '{parent_slug}' not found")
                    queryset = queryset.none()  # Return empty queryset
        
        # Search functionality
        search_query = self.request.query_params.get('search')
        if search_query:
            queryset = queryset.filter(
                Q(name__icontains=search_query) |
                Q(description__icontains=search_query) |
                Q(slug__icontains=search_query)
            )
            logger.info(f"Searched for '{search_query}': {queryset.count()} results")
        
        logger.info(f"Final queryset count: {queryset.count()}")
        return queryset

    def get_serializer_context(self):
        """
        Add request context to serializer for better URL handling
        """
        context = super().get_serializer_context()
        context['request'] = self.request
        return context