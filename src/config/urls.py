from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.shortcuts import redirect
from django.views.static import serve

# Bo'sh sahifaga (http://127.0.0.1:8001/) kirganda avtomat yashirin admin panelga o'tish logikasi
def root_redirect(request):
    return redirect('admin:index')

urlpatterns = [
    # Asosiy yo'nalish va avto-redirect
    path('', root_redirect, name='root_redirect'),
    
    # Kiberxavfsizlik uchun yashirin professional admin manzilimiz
    path('admin-1324/', admin.site.urls),
    
    # Biz yaratgan haqiqiy ilovalarning (Apps) API manzillari
    path('api/v1/users/', include('users.urls')),
    path('api/v1/kitchen/', include('menu.urls')),
    path('api/v1/map/', include('tapchanlar.urls')),
    path('api/v1/home/', include('home_page.urls')),
    path('api/v1/qr/', include('qr_code.urls')),
    
    # Statika va mediani lokalda DEBUG=False rejimida ham o'qitish mexanizmi
    path('static/<path:path>', serve, {'document_root': settings.STATIC_ROOT}),
    path('media/<path:path>', serve, {'document_root': settings.MEDIA_ROOT}),
]
