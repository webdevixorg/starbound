from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductDetailView, ProductView, RelatedProducts

router = DefaultRouter()
router.register(r'', ProductView, basename='product')

urlpatterns = [
    path('', include(router.urls)),
    # Retrieve or delete product by slug
    path('<slug:slug>/', ProductView.as_view({'get': 'retrieve', 'delete': 'destroy'}), name='product-detail'),
    # Retrieve or delete product by id
    path('id/<int:id>/', ProductDetailView.as_view(), name='product-detail-by-id'),
    # Related products by slug
    path('related-products/<slug:slug>/', RelatedProducts.as_view(), name='related-products'),
    # Latest products
    path('latest/', ProductView.as_view({'get': 'latest'}), name='product-latest'),
    # Change status or delete by slug
    path('<slug:slug>/change-status/', ProductDetailView.as_view(), name='post-status'),
    path('<slug:slug>/delete/', ProductDetailView.as_view(), name='post-status'),
]