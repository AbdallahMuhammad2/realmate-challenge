# Generated by Django 5.2.1 on 2025-05-09 20:08

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('conversations', '0002_rename_state_conversation_status_and_more'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='message',
            options={'ordering': ['created_at']},
        ),
        migrations.RenameField(
            model_name='conversation',
            old_name='status',
            new_name='state',
        ),
        migrations.RemoveField(
            model_name='conversation',
            name='updated_at',
        ),
    ]
