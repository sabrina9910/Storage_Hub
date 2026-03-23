import django_filters
from .models import Product

class ProductFilter(django_filters.FilterSet):
    name = django_filters.CharFilter(lookup_expr='icontains')
    sku = django_filters.CharFilter(lookup_expr='icontains')
    category = django_filters.UUIDFilter(field_name='category__id')

    class Meta:
        model = Product
        fields = ['name', 'sku', 'category', 'is_active', 'is_quarantined']