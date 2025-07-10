from django.conf import settings
from rest_framework import serializers
from django.contrib.auth.models import User

class MessageSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    sender = serializers.IntegerField()
    sender_name = serializers.SerializerMethodField()
    content = serializers.CharField()
    timestamp = serializers.DateTimeField()
    
    def get_sender_name(self, obj):
        try:
            user = User.objects.get(id=obj['sender'])
            return user.username
        except User.DoesNotExist:
            return 'Unknown'


class ConversationSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    title = serializers.CharField()
    participants = serializers.SerializerMethodField()

    def get_participants(self, obj):
        participant_ids = obj.get('participants', [])  # Assuming participant IDs are in conversation data
        participants = User.objects.filter(id__in=participant_ids).values(
            'id', 'first_name', 'last_name', 'profile__image'
        )
        # Construct the list of participants with image URLs
        return [
            {
                'id': participant['id'],
                'first_name': participant['first_name'],
                'last_name': participant['last_name'],
                'image': self.get_image(participant)
            }
            for participant in participants
        ]

    def get_image(self, participant):
        request = self.context.get('request')
        if participant.get('profile__image'):
            return request.build_absolute_uri(settings.MEDIA_URL + 'profiles/profile_images/' + participant['profile__image'])
        return None


class ConversationDetailSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    title = serializers.CharField()
    participants = serializers.SerializerMethodField()
    messages = MessageSerializer(many=True)

    def get_participants(self, obj):
        participant_ids = obj.get('participants', [])
        participants = User.objects.filter(id__in=participant_ids).values('id', 'username')
        return [{'id': participant['id'], 'username': participant['username']} for participant in participants]
