from rest_framework import serializers
from django.db import transaction
from .models import StockMovement
from prodotti.models import ProductLot, Product
from prodotti.serializers import ProductLotSerializer, ProductSerializer

class StockMovementSerializer(serializers.ModelSerializer):
    lot_detail = ProductLotSerializer(source='lot', read_only=True)
    product_detail = ProductSerializer(source='product', read_only=True)
    product_name = serializers.SerializerMethodField()
    product_sku = serializers.SerializerMethodField()
    
    class Meta:
        model = StockMovement
        fields = '__all__'
        read_only_fields = ['timestamp', 'user_full_name', 'user_email', 'user_role']
    
    def get_product_name(self, obj):
        if obj.product:
            return obj.product.name
        elif obj.lot:
            return obj.lot.product.name
        return 'N/A'
    
    def get_product_sku(self, obj):
        if obj.product:
            return obj.product.sku
        elif obj.lot:
            return obj.lot.product.sku
        return 'N/A'

    def create(self, validated_data):
        movement_type = validated_data.get('movement_type')
        quantity = validated_data.get('quantity')
        lot = validated_data.get('lot')
        
        # Validations before logic
        if quantity <= 0:
            raise serializers.ValidationError({"quantity": "Quantity must be greater than zero."})
            
        with transaction.atomic():
            # Lock the row for update
            lot = ProductLot.objects.select_for_update().get(id=lot.id)
            
            if movement_type == 'IN':
                lot.current_quantity += quantity
            elif movement_type == 'RETURN':
                lot.current_quantity += quantity
            elif movement_type == 'OUT':
                if lot.current_quantity < quantity:
                    raise serializers.ValidationError(
                        {"quantity": f"Cannot dispatch {quantity}. Lot currently has {lot.current_quantity}."}
                    )
                lot.current_quantity -= quantity
            elif movement_type == 'QUARANTINE':
                if lot.current_quantity < quantity:
                    raise serializers.ValidationError(
                        {"quantity": f"Cannot quarantine {quantity}. Lot currently has {lot.current_quantity}."}
                    )
                lot.current_quantity -= quantity
            
            lot.save()
            return super().create(validated_data)
