from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from datetime import timedelta

from core.permissions import IsMagazziniere
from .models import AuditLog
from .serializers import AuditLogSerializer
from .filters import AuditLogFilter

class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = AuditLogSerializer
    permission_classes = [IsMagazziniere]
    filterset_class = AuditLogFilter

    def get_queryset(self):
        user = self.request.user
        if not user or not user.is_authenticated:
            return AuditLog.objects.none()
        
        qs = AuditLog.objects.all().select_related('user', 'product')
        
        # Period filtering
        period = self.request.query_params.get('period')
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')
        
        if period:
            now = timezone.now()
            if period == 'today':
                start = now.replace(hour=0, minute=0, second=0, microsecond=0)
                qs = qs.filter(timestamp__gte=start)
            elif period == 'week':
                start = now - timedelta(days=now.weekday())
                start = start.replace(hour=0, minute=0, second=0, microsecond=0)
                qs = qs.filter(timestamp__gte=start)
            elif period == 'month':
                start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
                qs = qs.filter(timestamp__gte=start)
            elif period == 'year':
                start = now.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
                qs = qs.filter(timestamp__gte=start)
        
        if date_from and date_to:
            qs = qs.filter(timestamp__date__gte=date_from, timestamp__date__lte=date_to)
        
        return qs.order_by('-timestamp')

    @action(detail=False, methods=['get'], url_path='recent')
    def recent(self, request):
        """Get recent audit logs for dashboard widgets"""
        limit = int(request.query_params.get('limit', 10))
        logs = self.get_queryset()[:limit]
        serializer = self.get_serializer(logs, many=True)
        return Response(serializer.data)
