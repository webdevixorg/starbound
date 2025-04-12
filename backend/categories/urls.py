from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import CategoryView, ContentTypeList, CategoryListByParent

router = DefaultRouter()
router.register(r'categories', CategoryView, basename='category')

urlpatterns = [
    path('', include(router.urls)),
    path('content-type/', ContentTypeList.as_view(), name='get-content-type'),
    path('categories/<int:parent_id>/subcategories/', CategoryListByParent.as_view(), name='category-list-by-parent'),
]