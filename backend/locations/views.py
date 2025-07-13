from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response

from .models import Location
from .serializers import LocationSerializer


# ViewSet to provide CRUD operations for Location model (top-level locations)
class LocationViewSet(viewsets.ModelViewSet):
    queryset = Location.objects.all()            # All Location instances
    serializer_class = LocationSerializer        # Serializer for Location model


# ViewSet to provide CRUD for Sublocations
# Note: This currently uses the same queryset and serializer as Location
class SubLocationViewSet(viewsets.ModelViewSet):
    queryset = Location.objects.all()            # All Location instances (may want to filter to sublocations)
    serializer_class = LocationSerializer


# Custom APIView to get sublocations filtered by a parent location ID
class SubLocationListByLocation(APIView):
    def get(self, request, location_id):
        try:
            # Fetch all locations whose parent matches the given location_id (i.e., sublocations)
            sublocations = Location.objects.filter(parent_id=location_id)
            
            # Serialize list of sublocations (many=True)
            serializer = LocationSerializer(sublocations, many=True)
            
            # Return serialized sublocations with HTTP 200 OK
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        except Location.DoesNotExist:
            # If no sublocations found for given parent location
            return Response(
                {"error": "Sublocations not found for the specified location ID"},
                status=status.HTTP_404_NOT_FOUND
            )
