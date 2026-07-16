from django.db import models
from django.contrib.auth.models import User

class UserProfile(models.Model):
    """Профессиональный профиль пользователя для авторизации по номеру телефона"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    phone_number = models.CharField(max_length=15, unique=True, verbose_name="Telefon raqami")
    is_verified = models.BooleanField(default=False)
    otp_code = models.CharField(max_length=6, blank=True, null=True)

    class Meta:
        verbose_name = "Profil"
        verbose_name_plural = "Profillar"

    def __str__(self):
        return self.phone_number
