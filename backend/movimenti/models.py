import uuid
from django.db import models
from django.contrib.auth import get_user_model
from prodotti.models import ProductLot, Product

User = get_user_model()

class StockMovement(models.Model):
    MOVEMENT_TYPES = [
        ('STOCK_IN', 'Stock In'),
        ('STOCK_OUT', 'Stock Out'),
        ('QUARANTINED', 'Quarantined'),
        ('IN', 'IN'),
        ('OUT', 'OUT'),
        ('RETURN', 'RETURN'),
        ('QUARANTINE', 'QUARANTINE'),
        ('RESTORED', 'RESTORED'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    product = models.ForeignKey(Product, on_delete=models.CASCADE, related_name='movements', null=True, blank=True)
    lot = models.ForeignKey(ProductLot, on_delete=models.CASCADE, related_name='movements', null=True, blank=True)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    user_full_name = models.CharField(max_length=255, blank=True)
    user_email = models.EmailField(blank=True)
    user_role = models.CharField(max_length=50, blank=True)
    movement_type = models.CharField(max_length=20, choices=MOVEMENT_TYPES)
    quantity = models.IntegerField()
    timestamp = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"{self.movement_type} {self.quantity} for {self.product or self.lot}"
