from rest_framework import viewsets, status, permissions
from rest_framework.response import Response
from django.db import transaction
from .models import TapchanTable, Booking
from .serializers import TapchanTableSerializer, BookingSerializer

class TapchanTableViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = TapchanTable.objects.all()
    serializer_class = TapchanTableSerializer
    permission_classes = [permissions.AllowAny]

class BookingViewSet(viewsets.ModelViewSet):
    queryset = Booking.objects.all()
    serializer_class = BookingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def create(self, request, *args, **kwargs):
        tapchan_ids = request.data.get('tapchans', [])
        
        # Лимит режима "Банкет": Максимум 6 одновременно выбранных топчанов
        if len(tapchan_ids) > 6:
            return Response({"error": "Maksimal 6 tagacha tapchan tanlash mumkin!"}, status=status.HTTP_400_BAD_REQUEST)
        
        with transaction.atomic():
            # Защита от одновременного бронирования (Race Condition)
            reserved = TapchanTable.objects.filter(id__in=tapchan_ids, status='booked')
            if reserved.exists():
                return Response({"error": "Ayrim joylar allaqachon band!"}, status=status.HTTP_400_BAD_REQUEST)
            
            response = super().create(request, *args, **kwargs)
            # Переводим забронированные объекты в статус занятых
            TapchanTable.objects.filter(id__in=tapchan_ids).update(status='booked')
            return response
