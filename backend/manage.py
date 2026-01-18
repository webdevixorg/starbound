#!/usr/bin/env python
"""Django's command-line utility for administrative tasks."""
import os
import sys


def main():
    """Run administrative tasks."""
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'system.settings')

    # Monkey patch to fix DRF compatibility with Django > 4.2
    try:
        from django.urls import converters
        from django import urls
        
        original_register_converter = converters.register_converter

        def register_converter_idempotent(converter, type_name):
            try:
                original_register_converter(converter, type_name)
            except ValueError:
                pass # Already registered

        converters.register_converter = register_converter_idempotent
        urls.register_converter = register_converter_idempotent
    except ImportError:
        pass

    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "Couldn't import Django. Are you sure it's installed and "
            "available on your PYTHONPATH environment variable? Did you "
            "forget to activate a virtual environment?"
        ) from exc
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
