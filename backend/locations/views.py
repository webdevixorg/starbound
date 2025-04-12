# locations/views.py
from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response

from .models import Location
from .serializers import LocationSerializer

class LocationViewSet(viewsets.ModelViewSet):
    queryset = Location.objects.all()
    serializer_class = LocationSerializer

class SubLocationViewSet(viewsets.ModelViewSet):
    queryset = Location.objects.all()
    serializer_class = LocationSerializer

class SubLocationListByLocation(APIView):
    def get(self, request, location_id):
        try:
            # Retrieve sublocations for the given location ID
            sublocations = Location.objects.filter(parent_id=location_id)
            
            # Serialize the sublocations data
            serializer = LocationSerializer(sublocations, many=True)
            
            # Return the serialized data
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Location.DoesNotExist:
            return Response({"error": "Sublocations not found for the specified location ID"}, status=status.HTTP_404_NOT_FOUND)
