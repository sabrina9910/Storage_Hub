#!/usr/bin/env python3
import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from users.models import User

# Create or update users
users_data = [
    {
        'email': 'admin@storagehub.com',
        'password': 'admin123',
        'first_name': 'Admin',
        'last_name': 'User',
        'role': 'amministratore',
        'is_superuser': False,
    },
    {
        'email': 'magazziniere@storagehub.com',
        'password': 'magazzino123',
        'first_name': 'Magazziniere',
        'last_name': 'User',
        'role': 'magazziniere',
        'is_superuser': False,
    },
    {
        'email': 'superuser@storagehub.com',
        'password': 'super123',
        'first_name': 'Super',
        'last_name': 'Admin',
        'role': 'amministratore',
        'is_superuser': True,
    },
]

print("Creating/Updating users...")
for user_data in users_data:
    email = user_data.pop('email')
    password = user_data.pop('password')
    
    user, created = User.objects.update_or_create(
        email=email,
        defaults=user_data
    )
    user.set_password(password)
    user.save()
    
    status = "Created" if created else "Updated"
    print(f"{status}: {email} | Role: {user.role} | Superuser: {user.is_superuser}")

print("\n✅ Users setup complete!")
print("\nLogin credentials:")
print("=" * 50)
print("Admin:        admin@storagehub.com / admin123")
print("Magazziniere: magazziniere@storagehub.com / magazzino123")
print("Superuser:    superuser@storagehub.com / super123")
print("=" * 50)
