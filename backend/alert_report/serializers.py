from rest_framework import serializers
from prodotti.models import Product
from prodotti.serializers import ProductSerializer

class LowStockProductSerializer(ProductSerializer):
    total_stock = serializers.IntegerField(read_only=True)
    
    class Meta(ProductSerializer.Meta):
        fields = list(ProductSerializer.Meta.fields) if isinstance(ProductSerializer.Meta.fields, (list, tuple)) else []
        if not fields:
            # Se è '__all__', elenchiamo i campi esplicitamente o usiamo un approccio diverso
            fields = [f.name for f in Product._meta.fields] + ['total_stock']
        else:
            fields.append('total_stock')
