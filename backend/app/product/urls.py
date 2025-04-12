from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductDetailView, ProductView, RelatedProducts

router = DefaultRouter()


router.register(r'', ProductView, basename='product')

urlpatterns = [
    path('', include(router.urls)),
    path('<slug:slug>/', ProductView.as_view({'get': 'retrieve', 'delete': 'destroy'}), name='product-detail'),
    path('related-products/<slug:slug>/', RelatedProducts.as_view(), name='related-products'),
    path('latest/', ProductView.as_view({'get': 'latest'}), name='product-latest'),
    path('<slug:slug>/change-status/', ProductDetailView.as_view(), name='post-status'),
    path('<slug:slug>/delete/', ProductDetailView.as_view(), name='post-status'),
]