from django.contrib.auth.backends import ModelBackend
from .models import CustomUser

class IDNumberBackend(ModelBackend):
    def authenticate(self, request, username=None, password=None, **kwargs):
        try:
            user = CustomUser.objects.get(id_number=username)
            if user.check_password(password) and user.status == 'active':
                return user
        except CustomUser.DoesNotExist:
            return None
