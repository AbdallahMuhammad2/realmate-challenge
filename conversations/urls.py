from django.urls import path
from . import views

urlpatterns = [
    path('webhook/', views.WebhookView.as_view(), name='webhook'),
    path('conversations/', views.ConversationList.as_view(), name='conversation-list'),
    path('conversations/<str:pk>/', views.ConversationDetail.as_view(), name='conversation-detail'),
    
    # Additional endpoints you might want to add:
    path('conversations/<str:conversation_id>/messages/', views.MessageList.as_view(), name='message-list'),
    path('conversations/<str:conversation_id>/close/', views.CloseConversation.as_view(), name='close-conversation'),
    path('stats/', views.ConversationStats.as_view(), name='conversation-stats'),
]