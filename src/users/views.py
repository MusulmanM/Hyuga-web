from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from .models import UserProfile
from .serializers import RegisterSerializer, VerifyOTPSerializer
from menu.models import Cart # Автоматическое создание корзины при входе

class AuthAPIView(APIView):
    """Запрос OTP кода на телефон пользователя"""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        phone = serializer.validated_data['phone_number']
        
        # Генерация проверочного кода (для продакшна подключить SMS-шлюз Eskiz)
        otp = "111111" 
        
        username = f"user_{phone[-9:]}"
        user, created = User.objects.get_or_create(username=username)
        profile, _ = UserProfile.objects.get_or_create(user=user, defaults={'phone_number': phone})
        
        profile.otp_code = otp
        profile.save()
        
        # Гарантируем наличие корзины у пользователя
        Cart.objects.get_or_create(user=user)

        return Response({"message": "OTP tasdiqlash kodi yuborildi", "phone_number": phone}, status=status.HTTP_200_OK)

class VerifyOTPAPIView(APIView):
    """Проверка OTP кода и выдача JWT веб-токена доступа"""
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = VerifyOTPSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        phone = serializer.validated_data['phone_number']
        code = serializer.validated_data['otp_code']

        try:
            profile = UserProfile.objects.select_related('user').get(phone_number=phone, otp_code=code)
            profile.is_verified = True
            profile.otp_code = None
            profile.save()
            
            refresh = RefreshToken.for_user(profile.user)
            return Response({
                "access": str(refresh.access_token),
                "refresh": str(refresh)
            }, status=status.HTTP_200_OK)
        except UserProfile.DoesNotExist:
            return Response({"error": "Noto'g'ri kod yoki telefon raqami"}, status=status.HTTP_400_BAD_REQUEST)
