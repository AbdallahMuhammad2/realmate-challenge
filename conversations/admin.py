from django.contrib import admin
from .models import Conversation, Message

@admin.register(Conversation)
class ConversationAdmin(admin.ModelAdmin):
    list_display = ['id', 'state', 'created_at']
    list_filter = ['state']
    search_fields = ['id']

@admin.register(Message)
class MessageAdmin(admin.ModelAdmin):
    list_display = ['id', 'conversation', 'direction', 'content', 'created_at']  
    list_filter = ['direction', 'conversation']
    search_fields = ['content', 'conversation__id']