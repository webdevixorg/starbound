from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoryView, ContentTypeList, CategoryListByParent

# Create a DefaultRouter instance to automatically generate URL patterns for viewsets
router = DefaultRouter()

# Register the CategoryView viewset with the router under the 'categories' prefix
# 'basename' is used to name the URLs related to this viewset
router.register(r'categories', CategoryView, basename='category')

urlpatterns = [
    # Include all the automatically generated routes from the router
    path('', include(router.urls)),

    # Define a route for getting the list of content types, handled by a class-based view
    path('content-type/', ContentTypeList.as_view(), name='get-content-type'),

    # Define a route to get subcategories of a specific category given its parent_id
    # This uses a class-based view that filters categories by parent ID
    path('categories/<int:parent_id>/subcategories/', CategoryListByParent.as_view(), name='category-list-by-parent'),
]
