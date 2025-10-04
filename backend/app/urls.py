# system/urls.py  (main project urls.py)
from django.urls import path, include

urlpatterns = [
    # Routes for the posts app
    path('posts/', include('app.posts.urls')),

    # Routes for the FAQ app
    path('faqs/', include('app.faq.urls')),

    # Routes for the product app
    path('products/', include('app.product.urls')),
]
