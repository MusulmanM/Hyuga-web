from django.contrib import admin
from .models import TapchanTable, Booking

@admin.register(TapchanTable)
class TapchanTableAdmin(admin.ModelAdmin):
    list_display = ['number', 'item_type', 'status', 'is_banket_zone']
    list_filter = ['status', 'item_type', 'is_banket_zone']
    list_editable = ['status']  # Admin joyni band yoki bo'shligini qo'lda ham boshqara oladi
    search_fields = ['number']

@admin.register(Booking)
class BookingAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'date', 'arrival_time', 'adults_13_plus', 'kids_6_12', 'kids_under_6', 'total_booking_price', 'created_at']
    list_filter = ['date', 'created_at']
    search_fields = ['user__username', 'tapchans__number']
    filter_horizontal = ['tapchans']  # Ko'p tapchanlarni (Banketda 6 tagacha) chiroyli tanlash oynasi
