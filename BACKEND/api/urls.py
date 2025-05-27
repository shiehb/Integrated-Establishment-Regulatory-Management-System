from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView
from .views import LoginView, UserDetailView

urlpatterns = [
    path('login/', LoginView.as_view(), name='login'),
    path('user/', UserDetailView.as_view(), name='user'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]