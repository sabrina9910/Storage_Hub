# Generated manually
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('prodotti', '0003_product_quarantine_fields'),
    ]

    operations = [
        migrations.AddField(
            model_name='product',
            name='is_blacklisted',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='product',
            name='blacklist_reason',
            field=models.TextField(blank=True),
        ),
    ]
