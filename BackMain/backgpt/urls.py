from django.urls import path

from . import views

urlpatterns = [
    path('available', views.add_timeslot),
    path('available/delete', views.delete_timeslot),
    path('plan', views.generateTrainingPlan),
    path('available', views.add_timeslot),
    path('edit', views.update_training),
    path('training/delete', views.delete_training),
    path('chat', views.chat_list_create),
]
