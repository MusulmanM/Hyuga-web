from django.contrib import admin
from .models import TapchanQRCode

@admin.register(TapchanQRCode)
class TapchanQRCodeAdmin(admin.ModelAdmin):
    list_display = ['id', 'tapchan', 'qr_image', 'created_at']
    search_fields = ['tapchan__number']
    readonly_fields = ['qr_image']  # Rasm avtomat yaratilgani uchun o'zgartirib bo'lmaydi
