from django.urls import path
from .views import FAQListView, FAQDetailView

urlpatterns = [
    path('', FAQListView.as_view(), name='faq-list'),
    path('<int:pk>/', FAQDetailView.as_view(), name='faq-detail'),
]
