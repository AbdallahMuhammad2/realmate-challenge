from django.db import models
import uuid

class Conversation(models.Model):
    STATE_CHOICES = (
        ('OPEN', 'Open'),
        ('CLOSED', 'Closed'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    state = models.CharField(max_length=10, choices=STATE_CHOICES, default='OPEN')
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Conversation {self.id} - {self.state}"

class Message(models.Model):
    DIRECTION_CHOICES = (
        ('SENT', 'Sent'),
        ('RECEIVED', 'Received'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    conversation = models.ForeignKey(Conversation, related_name='messages', on_delete=models.CASCADE)
    direction = models.CharField(max_length=10, choices=DIRECTION_CHOICES)
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['created_at']
    
    def __str__(self):
        return f"{self.direction} message in {self.conversation.id}"