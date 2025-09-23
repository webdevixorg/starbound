#!/usr/bin/env python
"""
Django Test Runner for User Settings

This script runs the Django test suite specifically for the user_settings app.
It's useful for running isolated tests during development.

Usage:
    cd backend
    python ../scripts/testing/run_user_settings_tests.py

Or run from the project root:
    python scripts/testing/run_user_settings_tests.py
"""
import os
import sys
import django
from django.conf import settings
from django.test.utils import get_runner

def run_user_settings_tests():
    """Run the user_settings app test suite."""
    print("🧪 Running User Settings Test Suite...")
    print("=" * 40)
    
    # Setup Django environment
    backend_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'backend'))
    sys.path.insert(0, backend_path)
    
    os.environ['DJANGO_SETTINGS_MODULE'] = 'system.settings'
    django.setup()
    
    # Get the test runner and run tests
    TestRunner = get_runner(settings)
    test_runner = TestRunner(verbosity=2)
    failures = test_runner.run_tests(["user_settings"])
    
    if failures:
        print("\n❌ Some tests failed!")
        sys.exit(1)
    else:
        print("\n✅ All tests passed!")
        sys.exit(0)

if __name__ == "__main__":
    run_user_settings_tests()