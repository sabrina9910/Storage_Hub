from rest_framework import serializers
from .models import Product, ProductLot
from categorie.serializers import CategorySerializer
from fornitori.serializers import SupplierSimpleSerializer
from users.serializers import UserSerializer

class ProductSerializer(serializers.ModelSerializer):
    category_detail = CategorySerializer(source='category', read_only=True)
    suppliers_detail = SupplierSimpleSerializer(source='suppliers', many=True, read_only=True)
    quarantined_by_detail = UserSerializer(source='quarantined_by', read_only=True)
    
    class Meta:
        model = Product
        fields = '__all__'
        read_only_fields = ('owner',)

class ProductLotSerializer(serializers.ModelSerializer):
    product_detail = ProductSerializer(source='product', read_only=True)
    
    class Meta:
        model = ProductLot
        fields = '__all__'