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
        'is_superuser': True,
        'is_admin': True,
        'is_warehouse_worker': True,
        'label': 'Superuser',
    },
    {
        'email': 'manager@test.com',
        'password': 'managerpassword',
        'is_superuser': False,
        'is_admin': True,
        'is_warehouse_worker': False,
        'label': 'Manager/Admin',
    },
    {
        'email': 'worker@test.com',
        'password': 'workerpassword',
        'is_superuser': False,
        'is_admin': False,
        'is_warehouse_worker': True,
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
    print(f"   is_superuser={user.is_superuser}, is_admin={user.is_admin}, is_warehouse_worker={user.is_warehouse_worker}")
    print()

print("=== Setup completato! ===")
