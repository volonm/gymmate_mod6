from django.conf import settings
from django.db import models


# Create your models here.

class AvailabilityTimeslot(models.Model):
    userId = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    date = models.DateField()
    startTime = models.TimeField()
    endTime = models.TimeField()


class Training(models.Model):
    training_id = models.AutoField(primary_key=True)
    userId = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    day_goal = models.CharField(max_length=100)
    done = models.BooleanField(default=False)


class Exercise(models.Model):
    training = models.ForeignKey(Training, related_name='exercises', on_delete=models.CASCADE)
    name = models.CharField(max_length=100)
    repetitions = models.IntegerField()
    sets = models.IntegerField()


class Chat(models.Model):
    userId = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    sender = models.BooleanField()
    message = models.TextField()
    timestamp = models.DateTimeField()
