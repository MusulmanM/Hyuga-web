import qrcode
from io import BytesIO
from django.core.files import File
from django.db import models
from tapchanlar.models import TapchanTable  # Tapchanlar ilovasidan olamiz

class TapchanQRCode(models.Model):
    """Har bir tapchan uchun maxsus QR kod yaratish va saqlash modeli"""
    tapchan = models.OneToOneField(TapchanTable, on_delete=models.CASCADE, related_name='qr_code')
    qr_image = models.ImageField(upload_to='qr_codes/', blank=True, null=True, verbose_name="QR Kod rasmi")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name = "QR Kod"
        verbose_name_plural = "QR Kodlar"

    def __str__(self):
        return f"Tapchan #{self.tapchan.number} uchun QR"

    def save(self, *args, **kwargs):
        # Skanerlanganda mijozni qaysi manzilga yo'naltirishi (Frontend manzili)
        # Masalan: https://hyuga.uz
        frontend_url = f"https://hyuga.uz{self.tapchan.number}"
        
        # QR kodni generatsiya qilish
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(frontend_url)
        qr.make(fit=True)

        img = qr.make_image(fill_color="black", back_color="white")
        
        # Rasmni xotirada saqlab, ImageField'ga o'tkazish
        buffer = BytesIO()
        img.save(buffer, format='PNG')
        filename = f"qr_tapchan_{self.tapchan.number}.png"
        
        self.qr_image.save(filename, File(buffer), save=False)
        super().save(*args, **kwargs)
