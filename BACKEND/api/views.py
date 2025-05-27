from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth import authenticate
from .serializers import UserSerializer

@method_decorator(csrf_exempt, name='dispatch')

# login
class LoginView(APIView):
    permission_classes = [AllowAny]
    
    def post(self, request):
        id_number = request.data.get('id_number')
        password = request.data.get('password')
        
        if not id_number or not password:
            return Response({
                'detail': 'Both id_number and password are required.'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        user = authenticate(username=id_number, password=password)  # Note: using username field for id_number
        
        if user is not None and user.is_active:
            refresh = RefreshToken.for_user(user)
            serializer = UserSerializer(user)
            
            response_data = {
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': serializer.data
            }
            
            return Response(response_data, status=status.HTTP_200_OK)
        
        return Response({
            'detail': 'Invalid credentials'
        }, status=status.HTTP_401_UNAUTHORIZED)

# get user  if authenticated
class UserDetailView(APIView):
    permission_classes = [IsAuthenticated]
    
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response({
            'user': serializer.data
        }, status=status.HTTP_200_OK)