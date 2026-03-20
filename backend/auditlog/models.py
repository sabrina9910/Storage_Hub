import uuid
from django.db import models
from django.contrib.auth import get_user_model
from prodotti.models import Product

User = get_user_model()

class AuditLog(models.Model):
    ACTION_TYPES = [
        ('STOCK_IN', 'Stock In'),
        ('STOCK_OUT', 'Stock Out'),
        ('BLACKLISTED', 'Blacklisted'),
        ('RESTORED', 'Restored'),
        ('QUARANTINED', 'Quarantined'),
        ('ORDER_CREATED', 'Order Created'),
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name='audit_logs')
    user_full_name = models.CharField(max_length=255)
    user_email = models.EmailField()
    user_role = models.CharField(max_length=50)
    
    action_type = models.CharField(max_length=20, choices=ACTION_TYPES)
    product = models.ForeignKey(Product, on_delete=models.SET_NULL, null=True, related_name='audit_logs')
    product_name = models.CharField(max_length=255)
    product_sku = models.CharField(max_length=100)
    
    quantity = models.IntegerField(default=0)
    notes = models.TextField(blank=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['-timestamp']),
            models.Index(fields=['user']),
            models.Index(fields=['product']),
            models.Index(fields=['action_type']),
        ]

    def __str__(self):
        return f"{self.action_type} - {self.product_name} by {self.user_full_name} at {self.timestamp}"
