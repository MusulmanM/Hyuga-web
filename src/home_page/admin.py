from django.contrib import admin
from .models import PoolGallery

@admin.register(PoolGallery)
class PoolGalleryAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'uploaded_at']
    search_fields = ['title']
