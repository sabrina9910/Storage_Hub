from django.contrib import admin
from django.urls import path, include
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from users.serializers import EmailTokenObtainPairSerializer

class EmailTokenObtainPairView(TokenObtainPairView):
    serializer_class = EmailTokenObtainPairSerializer

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/users/', include('users.urls')),
    path('api/categories/', include('categorie.urls')),
    path('api/suppliers/', include('fornitori.urls')),
    path('api/', include('prodotti.urls')),
    path('api/movements/', include('movimenti.urls')),
    path('api/audit-log/', include('auditlog.urls')),
    path('api/chatbot/', include('chatbot.urls')),
    path('api/token/', EmailTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]