from django.conf import settings
from rest_framework import serializers
from .models import MyUser


# class UserSerializer(serializers.ModelSerializer):
#     class Meta(object):
#         model = MyUser
#         fields = ['id', 'username', 'password', 'email',
#                   'dateOfBirth', 'weight', 'height', 'goal']
#         extra_kwargs = {'password': {'write_only': True}}

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = MyUser
        fields = ['username', 'password', 'email', 'dateOfBirth', 'weight', 'height', 'goal', 'image']
        extra_kwargs = {'password': {'write_only': True}}

