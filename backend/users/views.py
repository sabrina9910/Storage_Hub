from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, FormParser
from .serializers import UserSerializer, LoginLogSerializer
from django.contrib.auth import get_user_model
from core.permissions import IsAmministratore
from django.db.models import Count
from movimenti.models import StockMovement
from .models import LoginLog

User = get_user_model()

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    
    def get_permissions(self):
        if self.action in ['me', 'profile', 'change_password']:
            return [permissions.IsAuthenticated()]
        if self.action in ['login_logs']:
            return [IsAmministratore()]
        return [IsAmministratore()]

    @action(detail=False, methods=['get'])
    def me(self, request):
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

    @action(detail=False, methods=['get', 'patch'], url_path='profile')
    def profile(self, request):
        if request.method == 'GET':
            serializer = self.get_serializer(request.user)
            return Response(serializer.data)
        elif request.method == 'PATCH':
            serializer = self.get_serializer(request.user, data=request.data, partial=True)
            if serializer.is_valid():
                serializer.save()
                return Response(serializer.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=['post'], url_path='profile/change-password')
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

    @action(detail=False, methods=['get'], url_path='login-logs')
    def login_logs(self, request):
        logs = LoginLog.objects.all()[:100]
        serializer = LoginLogSerializer(logs, many=True)
        return Response(serializer.data)
