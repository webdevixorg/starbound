from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from .models import Image
from .serializers import ImageSerializer

class ImageViewSet(viewsets.ViewSet):
    def list(self, request):
        object_id = request.query_params.get('object_id')
        content_type = request.query_params.get('content_type')
        
        # Add logging to check the values of object_id and content_type
        print(f"object_id: {object_id}, content_type: {content_type}")
        
        if object_id and content_type:
            queryset = Image.objects.filter(object_id=object_id, content_type=content_type)
        elif object_id:
            queryset = Image.objects.filter(object_id=object_id)
        elif content_type:
            queryset = Image.objects.filter(content_type=content_type)
        else:
            queryset = Image.objects.all()
        
        serializer = ImageSerializer(queryset, many=True)
        return Response(serializer.data)

    def create(self, request):
        serializer = ImageSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

    @action(detail=True, methods=['get'])
    def retrieve(self, request, pk=None):
        image = get_object_or_404(Image, pk=pk)
        serializer = ImageSerializer(image)
        return Response(serializer.data)

    @action(detail=True, methods=['delete'])
    def delete(self, request, pk=None):
        image = get_object_or_404(Image, pk=pk)
        image.delete()
        return Response(status=204)

    @action(detail=True, methods=['patch'], url_path='update')
    def update(self, request, pk=None):
        image = get_object_or_404(Image, pk=pk)
        update_fields = request.data
        
        if not update_fields:
            return Response({'error': 'No fields to update'}, status=status.HTTP_400_BAD_REQUEST)
        
        for field, value in update_fields.items():
            if hasattr(image, field):
                setattr(image, field, value)
            else:
                return Response({'error': f'Field {field} does not exist on Image model'}, status=status.HTTP_400_BAD_REQUEST)
        
        image.save()
        return Response({'status': 'Image updated'})