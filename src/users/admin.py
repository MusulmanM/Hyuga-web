from django.contrib import admin
from .models import UserProfile

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'phone_number', 'is_verified', 'otp_code']
    list_filter = ['is_verified']
    search_fields = ['phone_number', 'user__username']
    list_editable = ['is_verified']  # Admin o'zi qo'lda tasdiqlab qo'ya oladi
