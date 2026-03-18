from rest_framework import viewsets
from core.permissions import IsInventoryWorker
from .models import Supplier
from .serializers import SupplierSerializer

class SupplierViewSet(viewsets.ModelViewSet):
    serializer_class = SupplierSerializer
    permission_classes = [IsInventoryWorker]
    
    def get_queryset(self):
        return Supplier.objects.filter(is_active=True)
        
    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save()