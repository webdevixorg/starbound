from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ProductDetailView, FrontendProductView, ProfileProductView, RelatedProducts

# Frontend router for public access (no authentication required)
frontend_router = DefaultRouter()
frontend_router.register(r'f', FrontendProductView, basename='frontend-product')

# Profile router for authenticated users
profile_router = DefaultRouter()
profile_router.register(r'p', ProfileProductView, basename='profile-product')

urlpatterns = [
    # Frontend public API routes (no auth required)
    path('', include(frontend_router.urls)),
    
    # Profile authenticated API routes
    path('', include(profile_router.urls)),

    # Retrieve or delete product by slug
    path('<slug:slug>/', ProfileProductView.as_view({'get': 'retrieve', 'delete': 'destroy'}), name='product-detail'),
    # Retrieve or delete product by id
    path('id/<int:id>/', ProductDetailView.as_view(), name='product-detail-by-id'),
    
    # Related products by slug
    path('related-products/<slug:slug>/', RelatedProducts.as_view(), name='related-products'),
    # Latest products
    path('latest/', FrontendProductView.as_view({'get': 'latest'}), name='product-latest'),
    # Change status or delete by slug
    path('<slug:slug>/change-status/', ProfileProductView.as_view({'patch': 'change_status'}), name='post-status'),
    path('<slug:slug>/delete/', ProfileProductView.as_view({'delete': 'destroy'}), name='post-delete'),
]