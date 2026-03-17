from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # New App Routes
    path('api/users/', include('users.urls')),
    path('api/categories/', include('categorie.urls')),
    path('api/suppliers/', include('fornitori.urls')),
    path('api/', include('prodotti.urls')), # products and lots share this
    path('api/movements/', include('movimenti.urls')),
    
    # JWT routes matching api.ts
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]