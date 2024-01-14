from django.contrib import admin

from .models import *

# Register your models here.

admin.site.register(AvailabilityTimeslot)
admin.site.register(Training)
admin.site.register(Exercise)
admin.site.register(Chat)
