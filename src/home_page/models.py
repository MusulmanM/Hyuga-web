from django.db import models

class PoolGallery(models.Model):
    """Модель для динамической загрузки 4-х фото бассейна администратором"""
    title = models.CharField(max_length=100, blank=True)
    image = models.ImageField(upload_to='gallery/')
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        verbose_name_plural = "Pool Gallery"

    def __str__(self):
        return self.title or f"Photo #{self.id}"
