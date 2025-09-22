from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'contact-support', views.ContactSupportViewSet, basename='contact-support')
router.register(r'help-categories', views.HelpCategoryViewSet, basename='help-categories')
router.register(r'help-articles', views.HelpArticleViewSet, basename='help-articles')
router.register(r'feedback', views.FeedbackViewSet, basename='feedback')

urlpatterns = [
    path('', include(router.urls)),
]
