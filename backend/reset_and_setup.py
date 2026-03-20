#!/usr/bin/env python3
"""
Script per resettare e configurare il database
"""
import os
import sys
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
django.setup()

from django.contrib.auth import get_user_model
from django.core.management import call_command

User = get_user_model()

print("=== Reset e Setup Database ===\n")

# Applica tutte le migrazioni
print("📦 Applicando migrazioni...")
call_command('migrate', verbosity=0)
print("✅ Migrazioni applicate\n")

# Crea utenti di test
print("👤 Creando utenti di test...\n")

users_data = [
    {
        'email': 'test@test.com',
        'password': 'test1234',
        'first_name': 'Admin',
        'last_name': 'User',
        'role': 'amministratore',
        'is_superuser': True,
    },
    {
        'email': 'admin@test.com',
        'password': 'admin123',
        'first_name': 'Amministratore',
        'last_name': 'Test',
        'role': 'amministratore',
        'is_superuser': False,
    },
    {
        'email': 'worker@test.com',
        'password': 'worker123',
        'first_name': 'Magazziniere',
        'last_name': 'Test',
        'role': 'magazziniere',
        'is_superuser': False,
    },
]

for user_data in users_data:
    email = user_data['email']
    password = user_data.pop('password')
    
    if User.objects.filter(email=email).exists():
        user = User.objects.get(email=email)
        print(f"🔄 Aggiornando: {email}")
    else:
        user = User.objects.create_user(email=email, password=password)
        print(f"✅ Creato: {email}")
    
    for field, value in user_data.items():
        if field != 'email':
            setattr(user, field, value)
    
    user.set_password(password)
    user.save()
    print(f"   Password: {password}")
    print(f"   Ruolo: {user.role}\n")

print("=== Setup Completato! ===\n")
print("Credenziali disponibili:")
print("1. test@test.com / test1234 (Superuser)")
print("2. admin@test.com / admin123 (Amministratore)")
print("3. worker@test.com / worker123 (Magazziniere)")
