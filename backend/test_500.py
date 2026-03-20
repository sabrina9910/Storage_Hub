import os, django

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from rest_framework.test import APIClient
from users.models import User
import traceback

try:
    user = User.objects.first() # anyone
    client = APIClient()
    client.force_authenticate(user=user)
    
    # Test 1: Simple get
    resp = client.get('/api/movements/')
    print('GET /api/movements/ ->', resp.status_code)
    if resp.status_code == 500:
        print(resp.content.decode())

    # Test 2: date filter
    resp2 = client.get('/api/movements/?period=today')
    print('GET /api/movements/?period=today ->', resp2.status_code)
    if resp2.status_code == 500:
        print(resp2.content.decode())

except Exception as e:
    traceback.print_exc()
