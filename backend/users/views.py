from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from .serializers import UserSerializer
from django.contrib.auth import get_user_model
from core.permissions import IsAmministratore
from django.db.models import Count
from movimenti.models import StockMovement

User = get_user_model()

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    
    def get_permissions(self):
        if self.action in ['me', 'update_profile', 'change_password', 'stats']:
            return [permissions.IsAuthenticated()]
        return [IsAmministratore()]

    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    @action(detail=False, methods=['patch', 'put'], parser_classes=[MultiPartParser, FormParser])
    def update_profile(self, request):
        user = request.user
        serializer = self.get_serializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'])
    def change_password(self, request):
        user = request.user
        old_password = request.data.get('old_password')
        new_password = request.data.get('new_password')

        if not user.check_password(old_password):
            return Response({'detail': 'Vecchia password errata.'}, status=status.HTTP_400_BAD_REQUEST)
            
        if len(new_password) < 8:
            return Response({'detail': 'La password deve avere almeno 8 caratteri.'}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(new_password)
        user.save()
        return Response({'detail': 'Password aggiornata con successo.'})

    @action(detail=False, methods=['get'])
    def stats(self, request):
        user = request.user
        movements_count = StockMovement.objects.filter(user=user).count()
        # You can add more stats here
        return Response({
            'total_movements': movements_count,
            'role': user.role,
            'is_superuser': user.is_superuser
        })
