from django.core.management.base import BaseCommand
from users.models import User  # o CustomUser, a seconda di come l'avete chiamato
from fornitori.models import Supplier
from categorie.models import Category
from prodotti.models import Product, ProductLot
from movimenti.models import StockMovement

class Command(BaseCommand):
    help = 'Create test users with different roles'

    def handle(self, *args, **kwargs):
        users_data = [
            {
                'email': 'admin@example.com',
                'password': 'password123',
                'role': 'amministratore',
                'role_name': 'Admin'
            },
            {
                'email': 'worker@example.com',
                'password': 'password123',
                'role': 'magazziniere',
                'role_name': 'Worker'
            },
            {
                'email': 'manager@example.com',
                'password': 'password123',
                'role': 'amministratore',
                'role_name': 'Manager'
            }
        ]

        for data in users_data:
            email = data['email']
            if not User.objects.filter(email=email).exists():
                user = User.objects.create_user(
                    email=email,
                    password=data['password']
                )
                user.role = data['role']
                if data['role_name'] == 'Admin':
                    user.is_superuser = True
                user.save()
                self.stdout.write(self.style.SUCCESS(f'Successfully created {data["role_name"]} user: {email}'))
            else:
                self.stdout.write(self.style.WARNING(f'User {email} already exists'))
