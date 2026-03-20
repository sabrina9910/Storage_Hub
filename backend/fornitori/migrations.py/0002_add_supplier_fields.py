# Generated migration for supplier extended fields

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('fornitori', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='supplier',
            name='contact_info',
        ),
        migrations.AddField(
            model_name='supplier',
            name='business_name',
            field=models.CharField(blank=True, max_length=255),
        ),
        migrations.AddField(
            model_name='supplier',
            name='vat_number',
            field=models.CharField(blank=True, max_length=50),
        ),
        migrations.AddField(
            model_name='supplier',
            name='contact_person',
            field=models.CharField(blank=True, max_length=255),
        ),
        migrations.AddField(
            model_name='supplier',
            name='phone',
            field=models.CharField(blank=True, max_length=50),
        ),
        migrations.AddField(
            model_name='supplier',
            name='email',
            field=models.EmailField(blank=True, max_length=254),
        ),
        migrations.AddField(
            model_name='supplier',
            name='website',
            field=models.URLField(blank=True),
        ),
        migrations.AddField(
            model_name='supplier',
            name='address_street',
            field=models.CharField(blank=True, max_length=255),
        ),
        migrations.AddField(
            model_name='supplier',
            name='address_city',
            field=models.CharField(blank=True, max_length=100),
        ),
        migrations.AddField(
            model_name='supplier',
            name='address_country',
            field=models.CharField(blank=True, default='Italia', max_length=100),
        ),
        migrations.AddField(
            model_name='supplier',
            name='address_zip',
            field=models.CharField(blank=True, max_length=20),
        ),
        migrations.AddField(
            model_name='supplier',
            name='payment_terms',
            field=models.CharField(blank=True, max_length=255),
        ),
        migrations.AddField(
            model_name='supplier',
            name='notes',
            field=models.TextField(blank=True),
        ),
    ]
