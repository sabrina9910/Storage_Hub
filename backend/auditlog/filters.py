import django_filters
from .models import AuditLog

class AuditLogFilter(django_filters.FilterSet):
    action_type = django_filters.CharFilter(lookup_expr='iexact')
    user = django_filters.UUIDFilter(field_name='user__id')
    product = django_filters.UUIDFilter(field_name='product__id')
    date_from = django_filters.DateTimeFilter(field_name='timestamp', lookup_expr='gte')
    date_to = django_filters.DateTimeFilter(field_name='timestamp', lookup_expr='lte')

    class Meta:
        model = AuditLog
        fields = ['action_type', 'user', 'product']
