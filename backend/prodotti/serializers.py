from rest_framework import serializers
from .models import Product, ProductLot
from categorie.serializers import CategorySerializer
from fornitori.serializers import SupplierSerializer

class ProductSerializer(serializers.ModelSerializer):
    category_detail = CategorySerializer(source='category', read_only=True)
    suppliers_detail = SupplierSerializer(source='suppliers', many=True, read_only=True)
    
    class Meta:
        model = Product
        fields = '__all__'

class ProductLotSerializer(serializers.ModelSerializer):
    product_detail = ProductSerializer(source='product', read_only=True)
    
    class Meta:
        model = ProductLot
        fields = '__all__'