from django.urls import path

from . import views

urlpatterns = [
    path('setUserInfo', views.setUserInfo),
    path('getUserInfo', views.getUserInfo),
    path('setUserImage', views.setUserImage),
    path('getUserImage', views.getUserImage),
    path('getUserAvailability', views.getUserAvailability),
    path('getUserTrainings', views.getUserTrainings),
    path('setTrainingDone', views.toggle_training_done)
]
