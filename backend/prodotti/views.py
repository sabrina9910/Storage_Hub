from django.shortcuts import render

from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Sum, Q
from django.utils import timezone
from datetime import timedelta

from core.permissions import IsInventoryWorker
from .models import Product, ProductLot
from .serializers import ProductSerializer, ProductLotSerializer
from .filters import ProductFilter

class ProductViewSet(viewsets.ModelViewSet):
    serializer_class = ProductSerializer
    permission_classes = [IsInventoryWorker]
    filterset_class = ProductFilter

    def get_queryset(self):
        user = self.request.user
        if not user or not user.is_authenticated:
            return Product.objects.none()
            
        if getattr(user, 'is_superuser', False):
            return Product.objects.all()
        return Product.objects.filter(is_active=True)

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save()

    @action(detail=False, methods=['get'], permission_classes=[permissions.IsAuthenticated])
    def alerts(self, request):
        today = timezone.now().date()
        seven_days_later = today + timedelta(days=7)

        products = Product.objects.filter(is_active=True).annotate(
            total_stock=Sum('lots__current_quantity', filter=Q(lots__is_active=True))
        )
        low_stock_products = []
        for p in products:
            qty = p.total_stock or 0
            if qty < p.min_stock_threshold:
                low_stock_products.append({
                    "id": p.id,
                    "name": p.name,
                    "sku": p.sku,
                    "current_stock": qty,
                    "threshold": p.min_stock_threshold
                })

        expiring_lots_qs = ProductLot.objects.filter(
            is_active=True,
            current_quantity__gt=0,
            expiration_date__lte=seven_days_later,
            expiration_date__gte=today
        ).select_related('product')
        
        expired_lots_qs = ProductLot.objects.filter(
            is_active=True,
            current_quantity__gt=0,
            expiration_date__lt=today
        ).select_related('product')

        expiring_lots = [
            {
                "id": lot.id,
                "product_name": lot.product.name,
                "lot_number": lot.lot_number,
                "quantity": lot.current_quantity,
                "expiration_date": lot.expiration_date
            } for lot in expiring_lots_qs
        ]
        
        expired_lots = [
            {
                "id": lot.id,
                "product_name": lot.product.name,
                "lot_number": lot.lot_number,
                "quantity": lot.current_quantity,
                "expiration_date": lot.expiration_date
            } for lot in expired_lots_qs
        ]

        return Response({
            "low_stock": low_stock_products,
            "expiring_soon": expiring_lots,
            "already_expired": expired_lots,
            "total_inventory_value": sum(
                [(p.total_stock or 0) * p.unit_price for p in products]
            )
        })

class ProductLotViewSet(viewsets.ModelViewSet):
    serializer_class = ProductLotSerializer
    permission_classes = [IsInventoryWorker]

    def get_queryset(self):
        user = self.request.user
        if not user or not user.is_authenticated:
            return ProductLot.objects.none()
            
        if getattr(user, 'is_superuser', False):
            qs = ProductLot.objects.all()
        else:
            qs = ProductLot.objects.filter(is_active=True)
            
        return qs.order_by('expiration_date')

    def perform_destroy(self, instance):
        instance.is_active = False
        instance.save()
