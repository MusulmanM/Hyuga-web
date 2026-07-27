from django.contrib import admin
from .models import Category, FoodItem, Cart, CartItem, Order, OrderItem

@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'slug']
    prepopulated_fields = {'slug': ('name',)}  # Nomini yozganda slug o'zi avtomat yoziladi
    search_fields = ['name']

@admin.register(FoodItem)
class FoodItemAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'category', 'price', 'is_available']
    list_filter = ['is_available', 'category']
    search_fields = ['name', 'description']
    list_editable = ['price', 'is_available']  # Taom narxini va bor/yo'qligini tezkor o'zgartirish

class CartItemInline(admin.TabularInline):
    model = CartItem
    extra = 0

@admin.register(Cart)
class CartAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'total_price']
    inlines = [CartItemInline]

class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0

@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'status', 'payment_method', 'is_paid', 'total_amount', 'created_at']
    list_filter = ['status', 'payment_method', 'is_paid', 'created_at']
    search_fields = ['user__username', 'id']
    list_editable = ['status', 'is_paid']  # Oshxona statusni (Tayyorlanmoqda/Yetkazildi) shu yerda o'zgartiradi
    inlines = [OrderItemInline]  # Chek ichidagi taomlar ro'yxati ichida ko'rinadi
