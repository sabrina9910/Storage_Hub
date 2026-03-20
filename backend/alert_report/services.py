from django.db.models import Sum, Q, F, DecimalField, ExpressionWrapper
from django.db.models.functions import Coalesce
from prodotti.models import Product, ProductLot

def get_low_stock_products():
    """
    Restituisce l'elenco dei prodotti la cui giacenza totale (somma dei lotti attivi)
    è inferiore o uguale alla soglia minima impostata.
    """
    return Product.objects.filter(is_active=True).annotate(
        total_stock=Coalesce(
            Sum('lots__current_quantity', filter=Q(lots__is_active=True)),
            0
        )
    ).filter(total_stock__lte=F('min_stock_threshold'))

def get_quarantine_products():
    """
    Restituisce i prodotti che hanno lotti con movimenti di tipo 'QUARANTINE'.
    """
    from movimenti.models import StockMovement
    # Prodotti con almeno un movimento di quarantena
    quarantine_product_ids = StockMovement.objects.filter(
        movement_type='QUARANTINE'
    ).values_list('lot__product', flat=True).distinct()
    
    return Product.objects.filter(id__in=quarantine_product_ids)

def get_inventory_value():
    """
    Calcola il valore totale del magazzino sommando (quantità lotto * prezzo unità prodotto)
    per tutti i lotti e i prodotti attivi.
    """
    result = ProductLot.objects.filter(
        is_active=True,
        product__is_active=True
    ).aggregate(
        total_value=Sum(
            ExpressionWrapper(
                F('current_quantity') * F('product__unit_price'),
                output_field=DecimalField()
            )
        )
    )
    return result['total_value'] or 0
