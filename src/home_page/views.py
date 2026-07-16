from rest_framework import viewsets, permissions
from .models import PoolGallery
from .serializers import PoolGallerySerializer

class GalleryViewSet(viewsets.ReadOnlyModelViewSet):
    """Возвращает фотографии для главного экрана (лимит 4 штуки для оптимизации скорости)"""
    queryset = PoolGallery.objects.all().order_by('-uploaded_at')[:4]
    serializer_class = PoolGallerySerializer
    permission_classes = [permissions.AllowAny]
