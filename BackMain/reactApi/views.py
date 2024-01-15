import json
from datetime import datetime, date, timedelta, time
from django.core import serializers
from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.response import Response
from rest_framework import status
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from backgpt.models import AvailabilityTimeslot
from backgpt.models import Training
from backgpt.models import Exercise


@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def getUserInfo(request):
    try:
        data = {
            'username': request.user.username,
            'name': request.user.first_name,
            'last_name': request.user.last_name,
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
    try:
        my_user = request.user
        my_user.first_name = request.data['name']
        my_user.last_name = request.data['lastname']
        my_user.username = request.data['username']
        my_user.goal = request.data['goal']
        my_user.dateOfBirth = request.data['dateOfBirth']
        my_user.weight = request.data['weight']
        my_user.height = request.data['height']
        my_user.save()
    except json.JSONDecodeError as e:
        return JsonResponse({"status": "error", "message": f"Invalid JSON: {e}"}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return JsonResponse({"status": "error", "message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    return Response(
        {"good": str(request.user.goal) + " " + str(request.user.weight) + " " + str(request.user.height) + " "},
        status=200)


@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def setUserImage(request):
    try:
        my_user = request.user
        my_user.image = request.data['image']
        my_user.save()
    except json.JSONDecodeError as e:
        return JsonResponse({"status": "error", "message": f"Invalid JSON: {e}"}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return JsonResponse({"status": "error", "message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    return Response(
        {"good": str(request.user.goal) + " " + str(request.user.weight) + " " + str(request.user.height) + " "},
        status=200)


@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def getUserImage(request):
    try:
        data = {
            'image': request.user.image.url if request.user.image else None
        }
        return JsonResponse(data)

    except json.JSONDecodeError as e:
        return JsonResponse({"status": "error", "message": f"Invalid JSON: {e}"}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return JsonResponse({"status": "error", "message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def getUserAvailability(request):
    try:
        current_datetime = datetime.now()
        nearest_sunday = current_datetime + timedelta(days=(6 - current_datetime.weekday() + 7) % 7)
        if current_datetime.date() == nearest_sunday.date():
            nearest_sunday = nearest_sunday + timedelta(days=7)
        if current_datetime.time() > time(20, 0):
            current_datetime = current_datetime + timedelta(days=1)
        query = Q(date__gte=current_datetime.date(), date__lte=nearest_sunday.date())
        availability_query = AvailabilityTimeslot.objects.filter(query, userId=request.user.id)
        data = serializers.serialize('json', availability_query)
        data = json.loads(data)  # Parse the JSON string back into a Python object
        return JsonResponse({'data': data})

    except json.JSONDecodeError as e:
        return JsonResponse({"status": "error", "message": f"Invalid JSON: {e}"}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return JsonResponse({"status": "error", "message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def getUserTrainings(request):
    try:
        current_datetime = datetime.now()
        nearest_sunday = current_datetime + timedelta(days=(6 - current_datetime.weekday() + 7) % 7)
        if current_datetime.date() == nearest_sunday.date():
            nearest_sunday = nearest_sunday + timedelta(days=7)
        if current_datetime.time() > time(20, 0):
            current_datetime = current_datetime + timedelta(days=1)
        query = Q(start_time__gte=current_datetime, end_time__lte=nearest_sunday)
        training_query = Training.objects.filter(query, userId=request.user.id)
        # Initialize an empty list to hold all training data
        trainings_data = []
        for training in training_query:
            # Fetch the exercises related to the training
            exercises = Exercise.objects.filter(training=training)

            # Serialize the exercises
            exercises_data = [{'name': exercise.name, 'repetitions': exercise.repetitions, 'sets': exercise.sets} for
                              exercise in
                              exercises]

            # Add the training and its exercises to the list
            trainings_data.append({
                'training_id': training.training_id,
                'training_start': training.start_time,
                'training_end': training.end_time,
                'goal': training.day_goal,
                'done': training.done,
                # Add other training fields if necessary
                'exercises': exercises_data
            })

            # Return all training data as JSON
        return JsonResponse({'trainings': trainings_data})

    except json.JSONDecodeError as e:
        return JsonResponse({"status": "error", "message": f"Invalid JSON: {e}"}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return JsonResponse({"status": "error", "message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def toggle_training_done(request):
    try:
        training = get_object_or_404(Training, userId=request.user.id, training_id=request.data['training_id'])
        if training.userId != request.user:
            return Response({"error": "You are trying to change not your training"}, status=400)
        if training.done:
            training.done = False
        else:
            training.done = True
        training.save()
    except json.JSONDecodeError as e:
        return JsonResponse({"status": "error", "message": f"Invalid JSON: {e}"}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        return JsonResponse({"status": "error", "message": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    return Response(
        {"good": "updated"},
        status=200)
