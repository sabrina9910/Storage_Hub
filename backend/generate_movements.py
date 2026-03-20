import os
import django
import random
from datetime import timedelta
from django.utils import timezone

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from users.models import User
from prodotti.models import Product, ProductLot
from movimenti.models import StockMovement

def run():
    print("Generating extra Stock Movements...")
    admin_user = User.objects.filter(email='admin@storagehub.com').first()
    worker_user = User.objects.filter(email='magazziniere@storagehub.com').first()
    users = [admin_user, worker_user]

    lots = list(ProductLot.objects.filter(is_active=True))
    if not lots:
        print("No active lots found. Run seed_food_data.py first.")
        return

    now = timezone.now()
    types = ['OUT', 'OUT', 'OUT', 'RETURN', 'QUARANTINE']
    
    for _ in range(30):
        lot = random.choice(lots)
        user = random.choice(users)
        mov_type = random.choice(types)
        
        # Don't let lot dip below 0
        if lot.current_quantity > 0:
            qty = random.randint(1, min(10, lot.current_quantity))
            
            # create movement
            StockMovement.objects.create(
                lot=lot,
                product=lot.product,
                user=user,
                user_full_name=f"{user.first_name} {user.last_name}",
                user_email=user.email,
                user_role=user.role,
                movement_type=mov_type,
                quantity=qty,
                timestamp=now - timedelta(days=random.randint(0, 30), hours=random.randint(0, 24)),
                notes=f"Simulated {mov_type} operation"
            )
            
            # Adjust lot quantity
            if mov_type in ['OUT', 'QUARANTINE']:
                lot.current_quantity -= qty
            elif mov_type == 'RETURN':
                lot.current_quantity += qty
            lot.save()

    print("✅ Extra 30 movements generated successfully!")

if __name__ == '__main__':
    run()
