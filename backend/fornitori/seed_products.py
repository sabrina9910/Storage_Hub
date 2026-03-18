import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from core.models import Product, ProductLot, Category
from datetime import date, timedelta

cat, _ = Category.objects.get_or_create(name='Elettronica')
prod, _ = Product.objects.get_or_create(
    sku='EL-001',
    defaults={
        'category': cat,
        'name': 'Scheda Madre Rev. B',
        'unit_of_measure': 'pz',
        'unit_price': 150.00,
        'min_stock_threshold': 10
    }
)
ProductLot.objects.get_or_create(
    product=prod,
    lot_number='LOT-2026-A',
    defaults={
        'expiration_date': date.today() + timedelta(days=365),
        'current_quantity': 50
    }
)
print("Product and Lot seeded successfully!")