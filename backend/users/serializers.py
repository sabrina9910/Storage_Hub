from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'email', 'role', 'is_superuser',
            'first_name', 'last_name', 'avatar',
            'birth_date', 'hire_date', 'contract_type', 'phone'
        ]

class EmailTokenObtainPairSerializer(TokenObtainPairSerializer):
    username_field = 'email'
