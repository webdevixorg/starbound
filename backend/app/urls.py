from django.urls import path, include

urlpatterns = [
    path('posts/', include('app.posts.urls')),
    path('faqs/', include('app.faq.urls')),
    path('products/', include('app.product.urls')),
]