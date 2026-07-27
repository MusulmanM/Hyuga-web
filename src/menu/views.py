from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import transaction
from .models import Category, Cart, Order, OrderItem
from .serializers import CategorySerializer, CartSerializer, OrderSerializer

class MenuCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Sayt o'ta tez ishlashi uchun barcha kategoriya va taomlarni 
    bazaga ortiqcha so'rov yubormasdan (prefetch_related orqali) yuklovchi API.
    """
    queryset = Category.objects.prefetch_related('foods').all()
    serializer_class = CategorySerializer
    permission_classes = [permissions.AllowAny]


class CartViewSet(viewsets.ModelViewSet):
    """
    Tizimga kirgan foydalanuvchining shaxsiy savatini boshqarish API'si.
    """
    serializer_class = CartSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Har bir foydalanuvchi faqat o'z savatini va uning ichidagi taomlarni ko'radi
        return Cart.objects.filter(user=self.request.user).prefetch_related('items__food')

    @action(detail=False, methods=['post'], url_path='submit-to-tapchan')
    def submit_to_tapchan(self, request):
        """
        'Buyurtmani tapchanga yuborish' tugmasi bosilganda ishlaydigan logika.
        Frontend QR skanerdan olingan tapchan raqamini yuboradi, savat tozalanib, 
        ma'lumotlar 'Check' (Order) jadvaliga xavfsiz ko'chiriladi.
        """
        user = request.user
        tapchan_number = request.data.get('tapchan_number')  # Frontend QR koddan olingan raqamni yuboradi
        
        try:
            # Foydalanuvchining savatini barcha tanlangan taomlari bilan bazadan olamiz
            cart = Cart.objects.prefetch_related('items__food').get(user=user)
        except Cart.DoesNotExist:
            return Response({"error": "Savat topilmadi!"}, status=status.HTTP_404_NOT_FOUND)

        if not cart.items.exists():
            return Response({"error": "Savat hozircha bo'sh! Taom tanlang."}, status=status.HTTP_400_BAD_REQUEST)

        # Ma'lumotlar bazasida uzilish bo'lsa xato bermasligi uchun atomar tranzaksiya ishlatamiz
        with transaction.atomic():
            # 1. Yangi Check (Order) yaratamiz va unga skanerlangan tapchan raqamini biriktiramiz
            order = Order.objects.create(
                user=user, 
                status='pending', 
                tapchan_number=tapchan_number
            )

            # 2. Savat ichidagi barcha taomlarni yangi yaratilgan Check tarkibiga ko'chiramiz
            for item in cart.items.all():
                OrderItem.objects.create(
                    order=order,
                    food_name=item.food.name,
                    price=item.food.price,
                    quantity=item.quantity
                )
            
            # 3. Savatni butunlay tozalaymiz (UI-da 'Savat hozircha bo'sh' holatiga keladi)
            cart.items.all().delete()

        return Response({
            "message": f"Buyurtma #{tapchan_number}-tapchanga muvaffaqiyatli yuborildi!", 
            "order_id": order.id
        }, status=status.HTTP_201_CREATED)


class CheckViewSet(viewsets.ModelViewSet):
    """
    Foydalanuvchi pastdagi 'Check' tugmasini bosganda faol buyurtmalar ro'yxatini,
    jami summani ko'rishi va to'lov usulini tanlashi uchun API.
    """
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        # Foydalanuvchining faqat o'ziga tegishli cheklarini eng yangisidan boshlab chiqaradi
        return Order.objects.filter(user=self.request.user).prefetch_related('order_items').order_by('-created_at')

    @action(detail=True, methods=['post'], url_path='pay')
    def pay_order(self, request, pk=None):
        """
        Mijoz pul to'lashni bosganda to'lov turini tanlash logikasi (Click, Terminal, Naqd pul)
        """
        order = self.get_object()
        method = request.data.get('payment_method')
        
        if method not in ['click', 'terminal', 'cash']:
            return Response({"error": "Noto'g'ri to'lov turi tanlandi!"}, status=status.HTTP_400_BAD_REQUEST)
        
        order.payment_method = method
        order.is_paid = True  # Real tizimda to'lov provayderidan tasdiq kelganda true qilinadi
        order.save()
        
        return Response({
            "message": f"To'lov {method.upper()} usuli orqali muvaffaqiyatli qabul qilindi!"
        }, status=status.HTTP_200_OK)
