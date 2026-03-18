import django_filters
from .models import StockMovement

class StockMovementFilter(django_filters.FilterSet):
    movement_type = django_filters.CharFilter(lookup_expr='iexact')
    start_date = django_filters.DateTimeFilter(field_name='timestamp', lookup_expr='gte')
    end_date = django_filters.DateTimeFilter(field_name='timestamp', lookup_expr='lte')
    user = django_filters.UUIDFilter(field_name='user__id')

    class Meta:
        model = StockMovement
        fields = ['movement_type', 'user']
