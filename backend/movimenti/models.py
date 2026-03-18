import uuid
from django.db import models
from django.contrib.auth import get_user_model
from prodotti.models import ProductLot

User = get_user_model()

class StockMovement(models.Model):
    MOVEMENT_TYPES = [
        ('IN', 'IN'),
        ('OUT', 'OUT'),
        ('RETURN', 'RETURN'),
        ('QUARANTINE', 'QUARANTINE'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    lot = models.ForeignKey(ProductLot, on_delete=models.CASCADE, related_name='movements')
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    movement_type = models.CharField(max_length=20, choices=MOVEMENT_TYPES)
    quantity = models.IntegerField()
    timestamp = models.DateTimeField(auto_now_add=True)
    notes = models.TextField(blank=True)

    def __str__(self):
        return f"{self.movement_type} {self.quantity} for {self.lot}"
