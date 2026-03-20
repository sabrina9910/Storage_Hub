from django.db import models
import uuid

# Create your models here.
from django.contrib.auth import get_user_model
from categorie.models import Category
from fornitori.models import Supplier

User = get_user_model()

class Product(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    owner = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='owned_products')
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, related_name='products')
    suppliers = models.ManyToManyField(Supplier, related_name='products')
    sku = models.CharField(max_length=100, unique=True)
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    unit_of_measure = models.CharField(max_length=50) # kg, pcs, etc.
    unit_price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    min_stock_threshold = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)
    is_quarantined = models.BooleanField(default=False)
    quarantine_reason = models.TextField(blank=True)
    is_blacklisted = models.BooleanField(default=False)
    blacklist_reason = models.TextField(blank=True)

    def __str__(self):
        return f"[{self.sku}] {self.name}"

class ProductLot(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='lots')
    lot_number = models.CharField(max_length=100)
    expiration_date = models.DateField()
    current_quantity = models.IntegerField(default=0)
    is_active = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.product.name} (Lot: {self.lot_number})"