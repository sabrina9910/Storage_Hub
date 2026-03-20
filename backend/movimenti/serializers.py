from rest_framework import serializers
from django.db import transaction
from .models import StockMovement
from prodotti.models import ProductLot
from prodotti.serializers import ProductLotSerializer

class StockMovementSerializer(serializers.ModelSerializer):
    lot_detail = ProductLotSerializer(source='lot', read_only=True)
    user_email = serializers.EmailField(source='user.email', read_only=True)
    
    class Meta:
        model = StockMovement
        fields = '__all__'
        read_only_fields = ['timestamp', 'user']

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
