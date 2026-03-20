from rest_framework import serializers
from .models import Supplier

class SupplierSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Supplier
        fields = ['id', 'name', 'business_name', 'contact_person', 'email', 'phone']

class SupplierSerializer(serializers.ModelSerializer):
    products = serializers.SerializerMethodField()

    class Meta:
        model = Supplier
        fields = '__all__'

    def get_products(self, obj):
        from prodotti.models import Product
        products = Product.objects.filter(suppliers=obj, is_active=True)
        return [{
            'id': str(p.id),
            'sku': p.sku,
            'name': p.name,
            'unit_price': str(p.unit_price),
            'unit_of_measure': p.unit_of_measure,
        } for p in products]