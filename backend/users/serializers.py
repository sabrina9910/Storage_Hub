from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from .models import LoginLog

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'email', 'role', 'is_superuser',
            'first_name', 'last_name', 'avatar',
            'birth_date', 'hire_date', 'contract_type', 'phone'
        ]

class LoginLogSerializer(serializers.ModelSerializer):
    user_email = serializers.CharField(source='user.email', read_only=True)
    user_name = serializers.SerializerMethodField()
    user_role = serializers.CharField(source='user.role', read_only=True)

    class Meta:
        model = LoginLog
        fields = ['id', 'user', 'user_email', 'user_name', 'user_role', 'timestamp', 'ip_address', 'user_agent', 'success']

    def get_user_name(self, obj):
        if obj.user.first_name or obj.user.last_name:
            return f"{obj.user.first_name or ''} {obj.user.last_name or ''}".strip()
        return obj.user.email

class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = 'email'
