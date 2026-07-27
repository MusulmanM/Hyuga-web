from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from .models import TapchanQRCode
from .serializers import TapchanQRCodeSerializer

class QRCodeViewSet(viewsets.ReadOnlyModelViewSet):
    """QR kodlarni faqat o'qish uchun API (Tez ishlashi uchun select_related bilan)"""
    queryset = TapchanQRCode.objects.select_related('tapchan').all()
    serializer_class = TapchanQRCodeSerializer
    permission_classes = [permissions.AllowAny]

    @action(detail=False, methods=['get'], url_path='scan')
    def scan_qr(self, request):
        """
        Frontend QR kodni skanerlaganda shu joyga so'rov yuboradi.
        Bu yerda tapchan raqami borligi tekshiriladi.
        """
        tapchan_number = request.query_params.get('tapchan')
        if not tapchan_number:
            return Response({"error": "Tapchan raqami topilmadi!"}, status=status.HTTP_400_BAD_REQUEST)
            
        return Response({
            "message": f"Muvaffaqiyatli skanerlandi. Siz #{tapchan_number}-tapchandasiz.",
            "tapchan_number": tapchan_number
        }, status=status.HTTP_200_OK)
