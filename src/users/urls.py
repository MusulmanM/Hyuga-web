from django.urls import path
from .views import AuthAPIView, VerifyOTPAPIView

urlpatterns = [
    path('send-otp/', AuthAPIView.as_view(), name='send_otp'),
    path('verify-otp/', VerifyOTPAPIView.as_view(), name='verify_otp'),
]
