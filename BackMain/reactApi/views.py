from django.http import JsonResponse
from rest_framework.authentication import TokenAuthentication
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import IsAuthenticated
import json
from datetime import datetime, date, timedelta, time

from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from django.utils import timezone
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.response import Response
from rest_framework import status
import openai
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated



@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def getUserInfo(request):
#TODO: Add availability
    try:
        data = {
            'dateOfBirth': request.user.dateOfBirth,
            'weight': request.user.weight,
            'height': request.user.height,
            'goal': request.user.goal
        }
        return JsonResponse(data)

    except json.JSONDecodeError as e:
        return JsonResponse({"status": "error", "message": f"Invalid JSON: {e}"}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return JsonResponse({"status": "error", "message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def setUserInfo(request):
#TODO: Add availability

    try:
        my_user = request.user
        my_user.goal = request.data['goal']
        my_user.dateOfBirth = request.data['dateOfBirth']
        my_user.weight = request.data['weight']
        my_user.height = request.data['height']
        my_user.save()
    except json.JSONDecodeError as e:
        return JsonResponse({"status": "error", "message": f"Invalid JSON: {e}"}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return JsonResponse({"status": "error", "message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    return Response({"good": str(request.user.goal) + " " + str(request.user.weight) + " " + str(request.user.height) + " "},status=200)

    #     # serializer = UserSetSerializer(data = request.data)
    #     # if serializer.is_valid():
    #         user = serializer.save()
    #         user.save()
    #     return Response({"user": serializer.data})
    #
    # except json.JSONDecodeError as e:
    #     return JsonResponse({"status": "error", "message": f"Invalid JSON: {e}"}, status=status.HTTP_400_BAD_REQUEST)
    # except Exception as e:
    #     return JsonResponse({"status": "error", "message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)