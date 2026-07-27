from rest_framework import serializers
from .models import TapchanTable, Booking

class TapchanTableSerializer(serializers.ModelSerializer):
    class Meta:
        model = TapchanTable
        fields = ['id', 'number', 'item_type', 'status', 'is_banket_zone']

class BookingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Booking
        fields = ['id', 'tapchans', 'date', 'arrival_time', 'kids_under_6', 'kids_6_12', 'adults_13_plus', 'total_booking_price']
        read_only_fields = ['total_booking_price']
