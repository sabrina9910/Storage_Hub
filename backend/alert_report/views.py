from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from .services import get_low_stock_products, get_inventory_value, get_quarantine_products
from .serializers import LowStockProductSerializer
from prodotti.serializers import ProductSerializer

class LowStockAlertView(APIView):
    """
    Endpoint per ottenere l'elenco dei prodotti sotto soglia minima di scorta.
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        products = get_low_stock_products()
        serializer = LowStockProductSerializer(products, many=True)
        return Response(serializer.data)

class QuarantineAlertView(APIView):
    """
    Endpoint per ottenere l'elenco dei prodotti in quarantena.
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        products = get_quarantine_products()
        serializer = ProductSerializer(products, many=True)
        return Response(serializer.data)

class AlertListView(APIView):
    """
    Endpoint unificato che restituisce sia prodotti sotto scorta che in quarantena.
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        low_stock = get_low_stock_products()
        quarantine = get_quarantine_products()
        
        return Response({
            'low_stock': LowStockProductSerializer(low_stock, many=True).data,
            'quarantine': ProductSerializer(quarantine, many=True).data,
            'total_alerts': low_stock.count() + quarantine.count()
        })

class InventoryValueReportView(APIView):
    """
    Endpoint per ottenere il valore totale monetario del magazzino.
    """
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        total_value = get_inventory_value()
        return Response({
            'total_inventory_value': total_value,
            'currency': 'EUR' # Assumiamo EUR come default
        })
