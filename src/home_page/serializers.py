from rest_framework import serializers
from .models import PoolGallery

class PoolGallerySerializer(serializers.ModelSerializer):
    class Meta:
        model = PoolGallery
        fields = ['id', 'image']
