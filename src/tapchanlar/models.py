from django.db import models
from django.contrib.auth.models import User

class TapchanTable(models.Model):
    """Физическое устройство зон: 21 топчан, 2 стола"""
    TYPE_CHOICES = [('tapchan', 'Tapchan'), ('table', 'Stol')]
    STATUS_CHOICES = [('free', "Bo'sh"), ('booked', 'Band')]
    
    number = models.IntegerField(unique=True, verbose_name="Raqami")
    item_type = models.CharField(max_length=10, choices=TYPE_CHOICES, default='tapchan')
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='free')
    is_banket_zone = models.BooleanField(default=False, verbose_name="15-Banket")

    class Meta:
        ordering = ['number']

    def __str__(self):
        return f"{self.item_type.capitalize()} #{self.number}"

class Booking(models.Model):
    """Бронирование с расчетом стоимости на бэкенде исходя из возраста гостей"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bookings')
    tapchans = models.ManyToManyField(TapchanTable, related_name='bookings')
    date = models.DateField()
    arrival_time = models.TimeField()
    
    # Категории возрастов
    kids_under_6 = models.PositiveIntegerField(default=0) # 0 сум
    kids_6_12 = models.PositiveIntegerField(default=0)    # 80 000 сум
    adults_13_plus = models.PositiveIntegerField(default=0) # 150 000 сум
    
    total_booking_price = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        # Бизнес-логика цен (надежно защищена на сервере)
        self.total_booking_price = (self.kids_6_12 * 80000) + (self.adults_13_plus * 150000)
        super().save(*args, **kwargs)
