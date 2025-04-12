from django.urls import path # type: ignore
from .views import ReviewList

urlpatterns = [
    path('reviews/', ReviewList.as_view(), name='review-list'),
]
