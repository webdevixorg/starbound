# Starbound Scripts

This directory contains utility scripts and tools for the Starbound project.

## 📁 Directory Structure

```
scripts/
├── README.md                           # This file
└── testing/                           # Testing utilities
    ├── test_user_settings_implementation.py  # User settings manual test
    └── run_user_settings_tests.py           # Django test runner
```

## 🧪 Testing Scripts

### User Settings Implementation Test

**File:** `testing/test_user_settings_implementation.py`

A comprehensive manual test script that verifies the user settings implementation:

- Tests model creation and JSONB data storage
- Validates serializer functionality
- Checks individual section access methods
- Verifies data validation and error handling

**Usage:**

```bash
# From the backend directory
cd backend
python ../scripts/testing/test_user_settings_implementation.py

# Or from project root
python scripts/testing/test_user_settings_implementation.py
```

### Django Test Runner

**File:** `testing/run_user_settings_tests.py`

Runs the complete Django test suite for the user_settings app with proper output formatting.

**Usage:**

```bash
# From the backend directory
cd backend
python ../scripts/testing/run_user_settings_tests.py

# Or from project root
python scripts/testing/run_user_settings_tests.py
```

## 🚀 Future Scripts

Planned utility scripts:

- **Database Management**
  - Migration helpers
  - Data backup/restore
  - Database cleanup utilities

- **Development Tools**
  - Code generation scripts
  - Asset optimization
  - Deployment helpers

- **Data Processing**
  - Import/export utilities
  - Data migration scripts
  - Bulk operations

## 📝 Adding New Scripts

When adding new scripts:

1. **Organize by purpose** - Use subdirectories for related scripts
2. **Include documentation** - Add clear docstrings and usage examples
3. **Handle paths properly** - Make scripts runnable from multiple locations
4. **Error handling** - Include proper error handling and user feedback
5. **Update this README** - Document new scripts in the appropriate section

### Script Template

```python
#!/usr/bin/env python
"""
Brief description of what this script does.

Usage:
    python script_name.py [arguments]

Requirements:
    - List any special requirements
    - Dependencies, environment setup, etc.
"""
import sys
import os

def main():
    """Main script function."""
    print("Script starting...")

    try:
        # Your script logic here
        pass
    except Exception as e:
        print(f"❌ Error: {e}")
        sys.exit(1)

    print("✅ Script completed successfully!")

if __name__ == "__main__":
    main()
```

## 🔧 Environment Setup

Some scripts may require specific environment setup:

### Django Scripts

For scripts that interact with Django models:

```bash
export DJANGO_SETTINGS_MODULE=system.settings
# or
set DJANGO_SETTINGS_MODULE=system.settings  # Windows
```

### Python Path

Scripts are designed to work from multiple locations by dynamically adjusting the Python path.

## 📊 Script Status

| Script                               | Purpose            | Status      | Last Updated |
| ------------------------------------ | ------------------ | ----------- | ------------ |
| test_user_settings_implementation.py | Manual testing     | ✅ Complete | 2025-09-23   |
| run_user_settings_tests.py           | Django test runner | ✅ Complete | 2025-09-23   |
