"""
Test configuration for Django backend
"""
import os
from django.test import TestCase
from django.contrib.auth.models import User, Group
from rest_framework.test import APITestCase
from rest_framework import status
from django.urls import reverse

class AuthenticationTestCase(APITestCase):
    """Test user authentication endpoints"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
    def test_user_registration(self):
        """Test user registration endpoint"""
        url = reverse('signup')
        data = {
            'username': 'newuser',
            'email': 'newuser@example.com',
            'password': 'newpass123',
            'groups': [2]
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
    def test_user_login(self):
        """Test user login endpoint"""
        url = reverse('signin')
        data = {
            'username': 'testuser',
            'password': 'testpass123'
        }
        response = self.client.post(url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

class UserSettingsTestCase(TestCase):
    """Test user settings functionality"""
    
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )
        
    def test_default_settings_creation(self):
        """Test that default settings are created for new users"""
        from user_settings.models import UserSettings
        settings = UserSettings.objects.create(user=self.user)
        self.assertIsNotNone(settings.settings)
        self.assertIn('security', settings.settings)
        self.assertIn('preferences', settings.settings)
        self.assertIn('notifications', settings.settings)