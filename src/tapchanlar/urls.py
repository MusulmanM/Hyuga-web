from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TapchanTableViewSet, BookingViewSet

router = DefaultRouter()
router.register(r'zones', TapchanTableViewSet, basename='zones')
router.register(r'reserve', BookingViewSet, basename='reserve')

urlpatterns = [
    path('', include(router.urls)),
]
