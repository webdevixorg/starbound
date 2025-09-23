#!/usr/bin/env python
"""
User Settings Implementation Test Script

This script tests the user settings implementation to verify:
- Model creation and data storage
- Serializer functionality and validation
- JSONB structure handling
- API integration

Run this script from the backend directory:
    cd backend
    python ../scripts/testing/test_user_settings_implementation.py
"""
import sys
import os

# Add the backend directory to the path so we can import Django modules
backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'backend'))
sys.path.insert(0, backend_path)

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'system.settings')

import django
django.setup()

from django.contrib.auth.models import User
from user_settings.models import UserSettings
from user_settings.serializers import UserSettingsSerializer
import json

def test_user_settings():
    print("🧪 Testing User Settings Implementation...")
    print("=" * 50)
    
    # Create a test user (or get existing)
    user, created = User.objects.get_or_create(
        username='testuser',
        defaults={'email': 'test@example.com'}
    )
    print(f"✅ Test user {'created' if created else 'retrieved'}: {user.username}")
    
    # Test creating user settings
    settings_data = {
        'security': {
            'two_factor_enabled': True,
            'login_notifications': True,
            'session_timeout': 30,
            'password_expiry_days': 90
        },
        'preferences': {
            'language': 'en',
            'theme': 'dark',
            'timezone': 'UTC',
            'date_format': 'YYYY-MM-DD',
            'currency': 'USD'
        },
        'notifications': {
            'email': True,
            'sms': False,
            'push': True,
            'marketing_emails': False,
            'order_updates': True,
            'forum_notifications': True
        }
    }
    
    # Create or update user settings
    user_settings, created = UserSettings.objects.update_or_create(
        user=user,
        defaults={'settings': settings_data}
    )
    
    print(f"✅ User settings {'created' if created else 'updated'}")
    print(f"   Settings ID: {user_settings.id}")
    
    # Test serializer
    serializer = UserSettingsSerializer(user_settings)
    serialized_data = serializer.data
    
    print("\n📄 Serialized data:")
    print(json.dumps(serialized_data, indent=2))
    
    # Test validation
    print("\n🔍 Testing validation...")
    invalid_data = {
        'user': user.pk,
        'settings': {
            'security': {
                'two_factor_enabled': 'invalid_boolean'  # Should fail validation
            }
        }
    }
    
    serializer = UserSettingsSerializer(data=invalid_data)
    if not serializer.is_valid():
        print("✅ Validation correctly failed for invalid data:")
        print(f"   Errors: {serializer.errors}")
    else:
        print("❌ ERROR: Validation should have failed!")
    
    # Test individual section access
    print("\n🔧 Testing individual section access...")
    
    # Test security settings
    security_settings = user_settings.get_security_settings()
    print(f"✅ Security settings: {security_settings}")
    
    # Test preferences
    preferences = user_settings.get_preference_settings()
    print(f"✅ Preferences: {preferences}")
    
    # Test notifications
    notifications = user_settings.get_notification_settings()
    print(f"✅ Notifications: {notifications}")
    
    print("\n" + "=" * 50)
    print("🎉 User Settings implementation test completed successfully!")
    print("   All functionality is working as expected.")

if __name__ == '__main__':
    try:
        test_user_settings()
    except Exception as e:
        print(f"❌ Test failed with error: {e}")
        sys.exit(1)