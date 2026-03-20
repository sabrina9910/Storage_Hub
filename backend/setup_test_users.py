"""
Script per creare gli utenti di test nel database.
Esegui con: python setup_test_users.py
"""
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth import get_user_model

User = get_user_model()

users_to_create = [
    {
        'email': 'test@test.com',
        'password': 'test1234',
        'first_name': 'Super',
        'last_name': 'Mario',
        'phone': '+39 333 1234567',
        'contract_type': 'Indeterminato',
        'is_superuser': True,
        'role': 'amministratore',
        'label': 'Superuser',
    },
    {
        'email': 'manager@test.com',
        'password': 'managerpassword',
        'first_name': 'Giulia',
        'last_name': 'Amministratrice',
        'phone': '+39 333 7654321',
        'contract_type': 'Indeterminato',
        'is_superuser': False,
        'role': 'amministratore',
        'label': 'Manager/Admin',
    },
    {
        'email': 'worker@test.com',
        'password': 'workerpassword',
        'first_name': 'Luigi',
        'last_name': 'Verdi',
        'phone': '+39 333 9876543',
        'contract_type': 'Determinato',
        'is_superuser': False,
        'role': 'magazziniere',
        'label': 'Worker',
    },
]

print("=== Setup Utenti di Test ===\n")

for u in users_to_create:
    label = u.pop('label')
    email = u['email']
    password = u.pop('password')

    user, created = User.objects.get_or_create(email=email)
    user.set_password(password)
    for field, value in u.items():
        if field != 'email':
            setattr(user, field, value)
    user.save()

    action = "✅ Creato" if created else "🔄 Aggiornato"
    print(f"{action} [{label}]: {email} / {password}")
    print(f"   is_superuser={user.is_superuser}, role={user.role}")
    print()

print("=== Setup completato! ===")
