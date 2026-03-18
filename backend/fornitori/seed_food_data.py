import os
import django
import random
from datetime import timedelta
from django.utils import timezone

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from users.models import User  # o CustomUser, a seconda di come l'avete chiamato
from fornitori.models import Supplier
from categorie.models import Category
from prodotti.models import Product, ProductLot
from movimenti.models import StockMovement

def run():
    print("Clearing old data...")
    Category.objects.all().delete()
    Supplier.objects.all().delete()
    Product.objects.all().delete()

    admin_user = User.objects.filter(email='admin@example.com').first()
    worker_user = User.objects.filter(email='worker@example.com').first()

    if not admin_user or not worker_user:
        print("Test users not found. Make sure to run the initial seed first.")
        return

    print("Creating Categories...")
    cats = {
        'Latticini': Category.objects.create(name='Latticini', description='Formaggi, latte, burro e derivati'),
        'Salumi': Category.objects.create(name='Salumi', description='Insaccati e carni stagionate'),
        'Secco': Category.objects.create(name='Secco', description='Pasta, riso, farine e legumi secchi'),
        'Bevande': Category.objects.create(name='Bevande', description='Acqua, vino, birra e bibite'),
        'Freschi': Category.objects.create(name='Fresco', description='Ortofrutta e prodotti freschi')
    }

    print("Creating Suppliers...")
    suppliers = [
        Supplier.objects.create(name='Latterie Padane SpA', contact_info='info@latteriepadane.it - 02 1234567'),
        Supplier.objects.create(name='Salumificio Emiliano', contact_info='ordini@salumificioemiliano.it - 0521 987654'),
        Supplier.objects.create(name='Mulino Bianco Srl', contact_info='forniture@mulinobianco.it - 06 555444'),
        Supplier.objects.create(name='Cantine Riunite', contact_info='vino@cantineriunite.it - 045 112233')
    ]

    print("Creating Products...")
    today = timezone.now().date()
    
    products_data = [
        # Worker Owned Products
        {
            'name': 'Parmigiano Reggiano DOP 24 Mesi', 'sku': 'PRM-24M-001', 'cat': cats['Latticini'], 
            'uom': 'kg', 'price': 18.50, 'supplier': suppliers[0], 'owner': worker_user, 'min': 50,
            'lot_prefix': 'LOT-PRM24-', 'lots': [
                {'qty': 120, 'days_exp': 180},
                {'qty': 45, 'days_exp': 10} # Expiring soon
            ]
        },
        {
            'name': 'Olio Extra Vergine Oliva 1L', 'sku': 'EVO-1L-002', 'cat': cats['Secco'], 
            'uom': 'pz', 'price': 9.90, 'supplier': suppliers[2], 'owner': worker_user, 'min': 100,
            'lot_prefix': 'LOT-EVO-', 'lots': [
                {'qty': 200, 'days_exp': 365},
                {'qty': 50, 'days_exp': 30}
            ]
        },
        # Admin Owned Products
        {
            'name': 'Prosciutto di Parma DOP', 'sku': 'PRM-CRUD-001', 'cat': cats['Salumi'], 
            'uom': 'kg', 'price': 22.00, 'supplier': suppliers[1], 'owner': admin_user, 'min': 30,
            'lot_prefix': 'LOT-CRUDO-', 'lots': [
                {'qty': 80, 'days_exp': 90},
                {'qty': 15, 'days_exp': 5} # Expiring very soon
            ]
        },
        {
            'name': 'Latte Intero UHT 1L', 'sku': 'LAT-UHT-001', 'cat': cats['Latticini'], 
            'uom': 'pz', 'price': 1.20, 'supplier': suppliers[0], 'owner': admin_user, 'min': 500,
            'lot_prefix': 'LOT-UHT-', 'lots': [
                {'qty': 1000, 'days_exp': 120},
                {'qty': 300, 'days_exp': -2} # Already expired
            ]
        },
        {
            'name': 'Pasta di Gragnano IGP 500g', 'sku': 'PST-GRA-500', 'cat': cats['Secco'], 
            'uom': 'pz', 'price': 1.80, 'supplier': suppliers[2], 'owner': admin_user, 'min': 200,
            'lot_prefix': 'LOT-PST-', 'lots': [
                {'qty': 500, 'days_exp': 730}
            ]
        },
        {
            'name': 'Chianti Classico DOCG', 'sku': 'VNO-CHI-750', 'cat': cats['Bevande'], 
            'uom': 'pz', 'price': 12.50, 'supplier': suppliers[3], 'owner': admin_user, 'min': 60,
            'lot_prefix': 'LOT-CHI-', 'lots': [
                {'qty': 120, 'days_exp': 1000}
            ]
        }
    ]

    print("Generating Products and Lots...")
    for p_data in products_data:
        p = Product.objects.create(
            category=p_data['cat'],
            sku=p_data['sku'],
            name=p_data['name'],
            unit_of_measure=p_data['uom'],
            unit_price=p_data['price'],
            owner=p_data['owner'],
            min_stock_threshold=p_data['min']
        )
        p.suppliers.add(p_data['supplier'])

        # Create Lots
        for index, l_data in enumerate(p_data['lots']):
            lot = ProductLot.objects.create(
                product=p,
                lot_number=f"{p_data['lot_prefix']}{index+1}",
                expiration_date=today + timedelta(days=l_data['days_exp']),
                current_quantity=l_data['qty']
            )
            
            # Create a fake IN movement for traceability
            StockMovement.objects.create(
                lot=lot,
                user=p_data['owner'],
                movement_type='IN',
                quantity=l_data['qty'],
                notes='Initial Seed Data'
            )

    print("✅ F&B Data Seeding Complete!")

if __name__ == '__main__':
    run()