from django.shortcuts import render

# Create your views here.
from rest_framework import viewsets
from rest_framework.exceptions import ValidationError
from django.db import transaction

from core.permissions import IsMagazziniere
from .models import StockMovement
from .serializers import StockMovementSerializer
from .filters import StockMovementFilter

class StockMovementViewSet(viewsets.ModelViewSet):
    serializer_class = StockMovementSerializer
    permission_classes = [IsMagazziniere]
    filterset_class = StockMovementFilter

    def get_queryset(self):
        user = self.request.user
        if not user or not user.is_authenticated:
            return StockMovement.objects.none()
            
        qs = StockMovement.objects.all()
        return qs.order_by('-timestamp')

    def perform_create(self, serializer):
        with transaction.atomic():
            # Il serializer gestisce già la quantità sul lotto collegato nella sua logica create
            serializer.save(user=self.request.user)
