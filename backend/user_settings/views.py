from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.core.exceptions import ValidationError as DjangoValidationError

from .models import UserSettings
from .serializers import UserSettingsSerializer, SecuritySettingsSerializer, PreferenceSettingsSerializer, NotificationSettingsSerializer


class UserSettingsView(generics.RetrieveUpdateAPIView):
    """
    Retrieve and update user settings
    """
    serializer_class = UserSettingsSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        """Get or create user settings for the authenticated user"""
        settings, created = UserSettings.objects.get_or_create(user=self.request.user)
        return settings

    def update(self, request, *args, **kwargs):
        """Update user settings with validation"""
        try:
            return super().update(request, *args, **kwargs)
        except DjangoValidationError as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )


@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def security_settings(request):
    """
    Get or update security settings
    """
    user_settings, created = UserSettings.objects.get_or_create(user=request.user)
    
    if request.method == 'GET':
        security_data = user_settings.get_security_settings()
        serializer = SecuritySettingsSerializer(security_data)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = SecuritySettingsSerializer(data=request.data)
        if serializer.is_valid():
            try:
                user_settings.update_settings(serializer.validated_data, section='security')
                return Response(serializer.validated_data)
            except (ValueError, DjangoValidationError) as e:
                return Response(
                    {'error': str(e)},
                    status=status.HTTP_400_BAD_REQUEST
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def preference_settings(request):
    """
    Get or update preference settings
    """
    user_settings, created = UserSettings.objects.get_or_create(user=request.user)
    
    if request.method == 'GET':
        preference_data = user_settings.get_preference_settings()
        serializer = PreferenceSettingsSerializer(preference_data)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = PreferenceSettingsSerializer(data=request.data)
        if serializer.is_valid():
            try:
                user_settings.update_settings(serializer.validated_data, section='preferences')
                return Response(serializer.validated_data)
            except (ValueError, DjangoValidationError) as e:
                return Response(
                    {'error': str(e)},
                    status=status.HTTP_400_BAD_REQUEST
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'PUT'])
@permission_classes([IsAuthenticated])
def notification_settings(request):
    """
    Get or update notification settings
    """
    user_settings, created = UserSettings.objects.get_or_create(user=request.user)
    
    if request.method == 'GET':
        notification_data = user_settings.get_notification_settings()
        serializer = NotificationSettingsSerializer(notification_data)
        return Response(serializer.data)
    
    elif request.method == 'PUT':
        serializer = NotificationSettingsSerializer(data=request.data)
        if serializer.is_valid():
            try:
                user_settings.update_settings(serializer.validated_data, section='notifications')
                return Response(serializer.validated_data)
            except (ValueError, DjangoValidationError) as e:
                return Response(
                    {'error': str(e)},
                    status=status.HTTP_400_BAD_REQUEST
                )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reset_settings(request):
    """
    Reset all settings to defaults
    """
    user_settings, created = UserSettings.objects.get_or_create(user=request.user)
    
    # Reset to default settings
    user_settings.settings = user_settings.default_settings
    user_settings.save()
    
    serializer = UserSettingsSerializer(user_settings)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def settings_export(request):
    """
    Export all user settings
    """
    user_settings, created = UserSettings.objects.get_or_create(user=request.user)
    
    return Response({
        'user': request.user.username,
        'exported_at': user_settings.updated_at,
        'settings': user_settings.get_settings()
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def settings_import(request):
    """
    Import user settings from exported data
    """
    user_settings, created = UserSettings.objects.get_or_create(user=request.user)
    
    settings_data = request.data.get('settings')
    if not settings_data:
        return Response(
            {'error': 'Settings data is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        user_settings.update_settings(settings_data)
        serializer = UserSettingsSerializer(user_settings)
        return Response(serializer.data)
    except (ValueError, DjangoValidationError) as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )