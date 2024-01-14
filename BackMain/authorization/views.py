from django.contrib.auth.models import User
from django.http import JsonResponse
from rest_framework import status
from rest_framework.authentication import TokenAuthentication
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, authentication_classes, permission_classes, parser_classes
from rest_framework.generics import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import MyUser
from .serializers import UserSerializer
from rest_framework.parsers import MultiPartParser, FormParser


# Create your views here.

# Register User
# @api_view(['POST'])
# def create_user(request):
#     serializer = UserSerializer(data=request.data)
#     if serializer.is_valid():
#         serializer.save()
#         user = MyUser.objects.get(username=request.data['username'])
#         user.set_password(request.data['password'])
#         user.save()
#         token = Token.objects.create(user=user)
#         return Response({"token": token.key, "user": serializer.data})
#     return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
def create_user(request):
    serializer = UserSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        user.set_password(serializer.validated_data['password'])
        user.save()
        token = Token.objects.create(user=user)
        return Response({"token": token.key, "user": serializer.data})
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
def login(request):
    user = get_object_or_404(MyUser, username=request.data['username'])
    if not user.check_password(request.data['password']):
        return Response({"details": "Not found"}, status=status.HTTP_404_NOT_FOUND)
    token, created = Token.objects.get_or_create(user=user)
    serializer = UserSerializer(instance=user)
    response = JsonResponse({"user": serializer.data, "token": token.key})
    response.set_cookie('account_token', token.key, httponly=True, secure=True)
    return response


@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def tokenTest(request):
    return Response({"passed for {}".format(request.user.email)})
