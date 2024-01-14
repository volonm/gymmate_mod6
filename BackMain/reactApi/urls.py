from django.urls import path

from . import views

urlpatterns = [
    path('setUserInfo', views.setUserInfo),
    path('getUserInfo', views.getUserInfo),
]
