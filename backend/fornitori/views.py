from rest_framework import viewsets
from core.permissions import IsMagazziniere
from .models import Supplier
from .serializers import SupplierSerializer

class SupplierViewSet(viewsets.ModelViewSet):
    serializer_class = SupplierSerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsMagazziniere()]
        return [IsAmministratore()]
    
    def get_queryset(self):
        return Supplier.objects.filter(is_active=True)
        
    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save()