from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'is_admin', 'is_warehouse_worker', 'is_superuser']

class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = 'email'
