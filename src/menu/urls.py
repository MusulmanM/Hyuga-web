from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import MenuCategoryViewSet, CartViewSet, CheckViewSet

router = DefaultRouter()
router.register(r'categories', MenuCategoryViewSet, basename='menu')
router.register(r'cart', CartViewSet, basename='cart')
router.register(r'check', CheckViewSet, basename='check')

urlpatterns = [
    path('', include(router.urls)),
]
