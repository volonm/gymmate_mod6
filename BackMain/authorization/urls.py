from django.urls import path, include
from . import views

# 127.0.0.1:8000/auth/

urlpatterns = [
    path('reg', views.create_user),
    path('login', views.login),
    path('test', views.tokenTest),
]
