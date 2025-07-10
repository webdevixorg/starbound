from rest_framework import status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.generics import ListCreateAPIView
from django.shortcuts import get_object_or_404
from .models import Review
from .serializers import ReviewSerializer


# ✅ Public product page: View approved reviews by product
class ReviewByProduct(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        product_id = request.query_params.get('product_id')
        if not product_id:
            return Response({'detail': 'product_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

        # Only fetch approved reviews for the given product
        reviews = Review.objects.filter(product_id=product_id, approved=True).order_by('-created_at')
        serializer = ReviewSerializer(reviews, many=True)
        return Response(serializer.data)

class ReviewByUser(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user_id = request.data.get('user_id')
        if not user_id:
            return Response({"error": "user_id is required"}, status=status.HTTP_400_BAD_REQUEST)

        reviews = Review.objects.filter(user_id=user_id).select_related('product')
        serializer = ReviewSerializer(reviews, many=True)
        return Response(serializer.data)


# ✅ Authenticated endpoint: Staff sees all, customers see their own reviews
class ReviewList(ListCreateAPIView):
    serializer_class = ReviewSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Review.objects.all().order_by('-created_at')
        return Review.objects.filter(user=user).order_by('-created_at')

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


# ✅ Detail view: Edit only if owner or staff
class ReviewDetail(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        review = get_object_or_404(Review, pk=pk)
        user = request.user

        if not (user.is_staff or review.user == user):
            return Response({'detail': 'Not authorized.'}, status=status.HTTP_403_FORBIDDEN)

        serializer = ReviewSerializer(review, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
