from rest_framework import viewsets
from core.permissions import IsMagazziniere
from .models import Category
from .serializers import CategorySerializer

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [IsMagazziniere()]
        return [IsAmministratore()]