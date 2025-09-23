from django.test import TestCase
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from rest_framework.test import APITestCase
from rest_framework import status
from .models import UserSettings


class UserSettingsModelTest(TestCase):
    """Test cases for UserSettings model"""

    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )

    def test_user_settings_creation(self):
        """Test that user settings are created with defaults"""
        settings = UserSettings.objects.get(user=self.user)
        self.assertEqual(settings.user, self.user)
        self.assertIsInstance(settings.settings, dict)

    def test_default_settings_structure(self):
        """Test that default settings have correct structure"""
        settings = UserSettings.objects.get(user=self.user)
        default_settings = settings.get_settings()
        
        # Check main sections exist
        self.assertIn('security', default_settings)
        self.assertIn('preferences', default_settings)
        self.assertIn('notifications', default_settings)
        
        # Check security defaults
        security = default_settings['security']
        self.assertEqual(security['twoFactorSMS'], False)
        self.assertEqual(security['twoFactorTOTP'], False)
        self.assertEqual(security['loginNotifications'], True)

    def test_update_settings(self):
        """Test updating settings"""
        settings = UserSettings.objects.get(user=self.user)
        
        # Update security settings
        settings.update_settings({
            'twoFactorSMS': True,
            'twoFactorTOTP': True
        }, section='security')
        
        updated_settings = settings.get_security_settings()
        self.assertEqual(updated_settings['twoFactorSMS'], True)
        self.assertEqual(updated_settings['twoFactorTOTP'], True)

    def test_invalid_settings_validation(self):
        """Test that invalid settings raise validation error"""
        settings = UserSettings.objects.get(user=self.user)
        
        with self.assertRaises(ValueError):
            settings.update_settings({'invalid': True}, section='invalid_section')


class UserSettingsAPITest(APITestCase):
    """Test cases for UserSettings API endpoints"""

    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='testpass123'
        )

    def test_get_user_settings_authenticated(self):
        """Test getting user settings when authenticated"""
        self.client.force_authenticate(user=self.user)
        response = self.client.get('/api/settings/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('security', response.data)
        self.assertIn('preferences', response.data)
        self.assertIn('notifications', response.data)

    def test_get_user_settings_unauthenticated(self):
        """Test getting user settings when not authenticated"""
        response = self.client.get('/api/settings/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_update_security_settings(self):
        """Test updating security settings"""
        self.client.force_authenticate(user=self.user)
        
        data = {
            'twoFactorSMS': True,
            'twoFactorTOTP': True,
            'loginNotifications': False
        }
        
        response = self.client.put('/api/settings/security/', data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['twoFactorSMS'], True)

    def test_update_preferences(self):
        """Test updating preference settings"""
        self.client.force_authenticate(user=self.user)
        
        data = {
            'language': 'es',
            'theme': 'dark',
            'timezone': 'Europe/Madrid'
        }
        
        response = self.client.put('/api/settings/preferences/', data)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['language'], 'es')

    def test_reset_settings(self):
        """Test resetting settings to defaults"""
        self.client.force_authenticate(user=self.user)
        
        # First change some settings
        self.client.put('/api/settings/security/', {'twoFactorSMS': True})
        
        # Then reset
        response = self.client.post('/api/settings/reset/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Check that settings are back to defaults
        security = response.data['security']
        self.assertEqual(security['twoFactorSMS'], False)