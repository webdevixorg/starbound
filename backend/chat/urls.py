# chat/urls.py

from django.urls import path
from . import views

urlpatterns = [
    path('chat/', views.ConversationListView.as_view(), name='conversation-list'),
    path('chat/<int:pk>/', views.ConversationDetailView.as_view(), name='conversation-detail'),
    path('chat/<int:conversation_id>/messages/', views.MessageListView.as_view(), name='message-list'),
]
