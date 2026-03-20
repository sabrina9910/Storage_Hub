# Generated manually
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('movimenti', '0003_stockmovement_user'),
        ('prodotti', '0003_product_quarantine_fields'),
    ]

    operations = [
        migrations.AddField(
            model_name='stockmovement',
            name='product',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='movements', to='prodotti.product'),
        ),
        migrations.AddField(
            model_name='stockmovement',
            name='user_full_name',
            field=models.CharField(blank=True, max_length=255),
        ),
        migrations.AddField(
            model_name='stockmovement',
            name='user_email',
            field=models.EmailField(blank=True, max_length=254),
        ),
        migrations.AddField(
            model_name='stockmovement',
            name='user_role',
            field=models.CharField(blank=True, max_length=50),
        ),
        migrations.AlterField(
            model_name='stockmovement',
            name='lot',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='movements', to='prodotti.productlot'),
        ),
        migrations.AlterField(
            model_name='stockmovement',
            name='movement_type',
            field=models.CharField(choices=[('STOCK_IN', 'Stock In'), ('STOCK_OUT', 'Stock Out'), ('QUARANTINED', 'Quarantined'), ('IN', 'IN'), ('OUT', 'OUT'), ('RETURN', 'RETURN'), ('QUARANTINE', 'QUARANTINE')], max_length=20),
        ),
    ]
