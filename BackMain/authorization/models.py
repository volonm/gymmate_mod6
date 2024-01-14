from datetime import date

from django.db import models
from django.contrib.auth.models import AbstractUser, User


class MyUser(AbstractUser):
    dateOfBirth = models.DateField(default=date(2000, 10, 6))
    weight = models.FloatField(default=65)
    height = models.FloatField(default=170)
    goal = models.CharField(max_length=255)
    image = models.ImageField(null=True, blank=True, upload_to="images/")

