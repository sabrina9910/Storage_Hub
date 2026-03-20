from django.urls import path
from .views import LowStockAlertView, InventoryValueReportView, QuarantineAlertView, AlertListView

urlpatterns = [
    path('alerts/low-stock/', LowStockAlertView.as_view(), name='low-stock-alert'),
    path('alerts/quarantine/', QuarantineAlertView.as_view(), name='quarantine-alert'),
    path('alerts/all/', AlertListView.as_view(), name='all-alerts'),
    path('reports/inventory-value/', InventoryValueReportView.as_view(), name='inventory-value-report'),
]
