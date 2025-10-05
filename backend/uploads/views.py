from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication  # Change this
from django.shortcuts import get_object_or_404
from django.contrib.contenttypes.models import ContentType
from .models import Image
from .serializers import ImageSerializer, UserImageSerializer
from .image_optimizer import ImageOptimizer
import base64
import logging

logger = logging.getLogger(__name__)

class ImageViewSet(viewsets.ViewSet):
    authentication_classes = [JWTAuthentication]  # Add authentication
    permission_classes = [IsAuthenticated]  # Add permission

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

    def retrieve(self, request, pk=None):
        image = get_object_or_404(Image, pk=pk)
        serializer = ImageSerializer(image)
        return Response(serializer.data)

    def destroy(self, request, pk=None):
        image = get_object_or_404(Image, pk=pk)
        image.delete()
        return Response(status=204)

    @action(detail=True, methods=['patch'], url_path='update')
    def update_image(self, request, pk=None):
        image = get_object_or_404(Image, pk=pk)
        update_fields = request.data
        
        if not update_fields:
            return Response({'error': 'No fields to update'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Log the update attempt
        print(f"Updating image {pk} with fields: {update_fields}")
        
        # Track which fields are actually being updated
        updated_fields = []
        
        for field, value in update_fields.items():
            if hasattr(image, field):
                # Check if the value is actually different
                current_value = getattr(image, field)
                if current_value != value:
                    setattr(image, field, value)
                    updated_fields.append(field)
                    print(f"Updated field '{field}' from '{current_value}' to '{value}'")
                else:
                    print(f"Field '{field}' already has value '{value}', skipping update")
            else:
                return Response({'error': f'Field {field} does not exist on Image model'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Only save if there are actual changes
        if updated_fields:
            image.save()
            print(f"Saved image {pk} with updated fields: {updated_fields}")
            return Response({
                'status': 'Image updated',
                'updated_fields': updated_fields,
                'image': ImageSerializer(image).data
            })
        else:
            print(f"No changes detected for image {pk}")
            return Response({
                'status': 'No changes detected',
                'image': ImageSerializer(image).data
            })

    @action(detail=False, methods=['post'], url_path='optimize')
    def optimize_image(self, request):
        """
        Optimize an uploaded image and upload all versions to Supabase.
        
        Expected payload:
        {
            "image_data": "base64_encoded_image_data",
            "filename": "original_filename.jpg",
            "content_type": "product", // or "post", etc.
            "content_id": 123
        }
        
        Returns information about uploaded images.
        """
        try:
            image_data_b64 = request.data.get('image_data')
            filename = request.data.get('filename')
            content_type = request.data.get('content_type')
            content_id = request.data.get('content_id')
            
            if not all([image_data_b64, filename, content_type, content_id]):
                return Response(
                    {'error': 'Missing required fields: image_data, filename, content_type, content_id'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Decode base64 image data
            try:
                image_data = base64.b64decode(image_data_b64)
            except Exception as e:
                return Response(
                    {'error': f'Invalid base64 image data: {str(e)}'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Create optimized versions and upload all to Supabase
            upload_results = ImageOptimizer.create_optimized_versions(
                image_data, filename, content_type, int(content_id)
            )
            
            if not upload_results:
                return Response(
                    {'error': 'Failed to upload images'}, 
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )
            
            return Response({
                'status': 'success',
                'uploaded_images': upload_results,
                'original_filename': filename,
                'message': f'Successfully uploaded {len(upload_results)} image versions'
            })
            
        except Exception as e:
            logger.error(f"Error optimizing and uploading image: {str(e)}")
            return Response(
                {'error': f'Image optimization and upload failed: {str(e)}'}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
    
class UserImageViewSet(viewsets.ViewSet):
    authentication_classes = [JWTAuthentication]  # Add authentication
    permission_classes = [IsAuthenticated]  # Add permission

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
        
        serializer = UserImageSerializer(queryset, many=True)
        return Response(serializer.data)

    def create(self, request):
        serializer = UserImageSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)

    def retrieve(self, request, pk=None):
        image = get_object_or_404(Image, pk=pk)
        serializer = UserImageSerializer(image)
        return Response(serializer.data)

    def destroy(self, request, pk=None):
        image = get_object_or_404(Image, pk=pk)
        image.delete()
        return Response(status=204)

    @action(detail=True, methods=['patch'], url_path='update')
    def update_user_image(self, request, pk=None):
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