# visits/views.py
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from .models import Visit
from .serializers import VisitSerializer

class RecordVisitView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        user_id = request.user.id  # explicit
        visits = Visit.objects.filter(user_id=user_id).order_by('-timestamp')
        serializer = VisitSerializer(visits, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, *args, **kwargs):
        # Debug: Print the received data
        print(f"Received data: {request.data}")
        print(f"User: {request.user}")
        
        # Get data directly from request
        item_id = request.data.get('item_id')
        item_type = request.data.get('item_type')
        timestamp = request.data.get('timestamp')
        
        # Validate the data using the serializer
        serializer = VisitSerializer(data=request.data)
        if serializer.is_valid():
            # Use update_or_create to handle duplicates gracefully
            visit, created = Visit.objects.update_or_create(
                user=request.user,
                item_id=item_id,
                item_type=item_type,
                defaults={'timestamp': timestamp}
            )
            
            if created:
                print(f"Created new visit: {visit}")
                return Response({'status': 'visit recorded'}, status=status.HTTP_201_CREATED)
            else:
                print(f"Updated existing visit: {visit}")
                return Response({'status': 'visit updated'}, status=status.HTTP_200_OK)
        else:
            print(f"Serializer errors: {serializer.errors}")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
