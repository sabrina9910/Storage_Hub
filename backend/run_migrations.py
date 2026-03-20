#!/usr/bin/env python3
import os
import sys
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
django.setup()

from django.core.management import call_command

print("Applicando migrazioni...")
call_command('migrate', verbosity=1)
print("\n✅ Migrazioni applicate con successo!")
