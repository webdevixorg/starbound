from django.urls import path
from .views import ReviewByUser, ReviewList, ReviewDetail, ReviewByProduct

urlpatterns = [
    path('reviews/', ReviewList.as_view(), name='review-list'),  # for create (POST) and optionally list
    path('reviews/manage/', ReviewList.as_view(), name='review-manage'),  # staff/customers (list/manage)
    path('reviews/by-product/', ReviewByProduct.as_view(), name='review-by-product'),
    path('reviews/by-user/', ReviewByUser.as_view(), name='review-by-user'),
    path('reviews/<int:pk>/', ReviewDetail.as_view(), name='review-detail'),
]
