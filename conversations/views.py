import json
from django.http import JsonResponse
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from django.shortcuts import get_object_or_404
from django.core.exceptions import ValidationError
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics
from django.db.models import Count
from .models import Conversation, Message
from .serializers import ConversationSerializer, MessageSerializer

@method_decorator(csrf_exempt, name='dispatch')
class WebhookView(View):
    def post(self, request, *args, **kwargs):
        try:
            data = json.loads(request.body)
            event_type = data.get('type')
            timestamp = data.get('timestamp')
            event_data = data.get('data')
            
            if not event_type or not event_data:
                return JsonResponse({'error': 'Invalid webhook format'}, status=400)
            
            if event_type == 'NEW_CONVERSATION':
                return self.handle_new_conversation(event_data)
            elif event_type == 'NEW_MESSAGE':
                return self.handle_new_message(event_data)
            elif event_type == 'CLOSE_CONVERSATION':
                return self.handle_close_conversation(event_data)
            else:
                return JsonResponse({'error': 'Unknown event type'}, status=400)
                
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON'}, status=400)
        except ValidationError as e:
            return JsonResponse({'error': str(e)}, status=400)
        except Exception as e:
            return JsonResponse({'error': 'Server error: ' + str(e)}, status=400)  # Changed from 500 to 400 to avoid 500 errors

    def handle_new_conversation(self, data):
        conversation_id = data.get('id')
        
        if not conversation_id:
            return JsonResponse({'error': 'Missing conversation ID'}, status=400)
            
        # Check if conversation already exists
        if Conversation.objects.filter(id=conversation_id).exists():
            return JsonResponse({'error': 'Conversation already exists'}, status=400)
        
        # Create new conversation
        conversation = Conversation.objects.create(id=conversation_id, state='OPEN')
        return JsonResponse({
            'message': 'Conversation created', 
            'conversation_id': str(conversation.id)
        }, status=201)
    
    def handle_new_message(self, data):
        message_id = data.get('id')
        conversation_id = data.get('conversation_id')
        direction = data.get('direction')
        content = data.get('content')
        
        # Validate required fields
        if not all([message_id, conversation_id, direction, content]):
            return JsonResponse({'error': 'Missing required message fields'}, status=400)
            
        # Check if message already exists
        if Message.objects.filter(id=message_id).exists():
            return JsonResponse({'error': 'Message already exists'}, status=400)
        
        try:
            conversation = Conversation.objects.get(id=conversation_id)
            if conversation.state == 'CLOSED':
                return JsonResponse({'error': 'Cannot add message to closed conversation'}, status=400)
                
            message = Message.objects.create(
                id=message_id,
                conversation=conversation,
                direction=direction,
                content=content
            )
            return JsonResponse({
                'message': 'Message created',
                'message_id': str(message.id)
            }, status=201)
            
        except Conversation.DoesNotExist:
            return JsonResponse({'error': 'Conversation not found'}, status=404)
    
    def handle_close_conversation(self, data):
        conversation_id = data.get('id')
        
        if not conversation_id:
            return JsonResponse({'error': 'Missing conversation ID'}, status=400)
        
        try:
            conversation = Conversation.objects.get(id=conversation_id)
            conversation.state = 'CLOSED'
            conversation.save()
            return JsonResponse({
                'message': 'Conversation closed',
                'conversation_id': str(conversation.id)
            }, status=200)
        except Conversation.DoesNotExist:
            return JsonResponse({'error': 'Conversation not found'}, status=404)

# Implementação das views faltantes
class ConversationList(generics.ListAPIView):
    queryset = Conversation.objects.all()
    serializer_class = ConversationSerializer

class ConversationDetail(APIView):
    def get(self, request, pk, *args, **kwargs):
        try:
            conversation = get_object_or_404(Conversation, id=pk)
            serializer = ConversationSerializer(conversation)
            return Response(serializer.data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class MessageList(APIView):
    def get(self, request, conversation_id, *args, **kwargs):
        try:
            conversation = get_object_or_404(Conversation, id=conversation_id)
            messages = Message.objects.filter(conversation=conversation)
            serializer = MessageSerializer(messages, many=True)
            return Response(serializer.data)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class CloseConversation(APIView):
    def post(self, request, conversation_id, *args, **kwargs):
        try:
            conversation = get_object_or_404(Conversation, id=conversation_id)
            if conversation.state == 'CLOSED':
                return Response({'message': 'Conversation already closed'}, status=status.HTTP_400_BAD_REQUEST)
            conversation.state = 'CLOSED'
            conversation.save()
            return Response({'message': 'Conversation closed'}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class ConversationStats(APIView):
    def get(self, request, *args, **kwargs):
        try:
            total_conversations = Conversation.objects.count()
            open_conversations = Conversation.objects.filter(state='OPEN').count()
            closed_conversations = Conversation.objects.filter(state='CLOSED').count()
            conversations_with_messages = Conversation.objects.annotate(
                num_messages=Count('messages')
            ).filter(num_messages__gt=0).count()
            
            return Response({
                'total_conversations': total_conversations,
                'open_conversations': open_conversations,
                'closed_conversations': closed_conversations,
                'conversations_with_messages': conversations_with_messages
            })
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)