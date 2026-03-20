# Generated manually
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('prodotti', '0002_product_owner_product_suppliers_productlot_product'),
    ]

    operations = [
        migrations.AddField(
            model_name='product',
            name='is_quarantined',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='product',
            name='quarantine_reason',
            field=models.TextField(blank=True),
        ),
    ]
