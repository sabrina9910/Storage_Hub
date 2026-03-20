from django.core.management.base import BaseCommand
from users.models import User

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
            user, created = User.objects.get_or_create(email=email)
            if created:
                user.set_password(data['password'])
                self.stdout.write(self.style.SUCCESS(f'Created {data["role_name"]} user: {email}'))
            else:
                self.stdout.write(self.style.WARNING(f'Updating permissions for {data["role_name"]}: {email}'))
            
            user.role = data['role']
            user.save()
        
        self.stdout.write(self.style.SUCCESS('Users seeded successfully'))
