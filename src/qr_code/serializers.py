from rest_framework import serializers
from .models import TapchanQRCode

class TapchanQRCodeSerializer(serializers.ModelSerializer):
    tapchan_number = serializers.IntegerField(source='tapchan.number', read_only=True)

    class Meta:
        model = TapchanQRCode
        fields = ['id', 'tapchan_number', 'qr_image']
