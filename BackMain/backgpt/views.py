import json
from datetime import datetime, date, timedelta, time

from django.db.models import Q
from django.shortcuts import get_object_or_404
from django.http import JsonResponse
from django.utils import timezone
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.response import Response
from .models import Training, Exercise, AvailabilityTimeslot, Chat
from .serializers import TimeslotSerializer, TimeslotDeleteSerializer, TrainingDeleteSerializer, \
    TrainingUpdateSerializer, ChatSerializer
from rest_framework import status
import openai
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated


@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def add_timeslot(request):
    timeslots_data = request.data.get('timeslots', [])

    if not timeslots_data:
        return Response({'error': 'No timeslots provided'}, status=status.HTTP_400_BAD_REQUEST)

    valid_timeslots = []
    errors = []

    for timeslot_data in timeslots_data:
        timeslot_data['userId'] = request.user.id
        serializer = TimeslotSerializer(data=timeslot_data)
        if serializer.is_valid():
            # You can modify serializer.validated_data here if needed
            valid_timeslot = serializer.save()  # No commit argument
            valid_timeslots.append(valid_timeslot)
        else:
            errors.append(serializer.errors)

    if errors:
        return Response({'errors': errors}, status=status.HTTP_400_BAD_REQUEST)

    # Bulk create is not necessary anymore as objects are already saved
    return Response({'message': 'Timeslots added successfully'}, status=status.HTTP_201_CREATED)


# @permission_classes([IsAuthenticated])


@api_view(['DELETE'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def delete_timeslot(request):
    serializer = TimeslotDeleteSerializer(data=request.data)
    if serializer.is_valid():
        try:
            timeslot_id = serializer.validated_data['id']
            timeslot = AvailabilityTimeslot.objects.get(id=timeslot_id)
            if timeslot.userId != request.user:
                return Response({"error": "You are trying to change not your training"}, status=400)
        except Training.DoesNotExist:
            return Response({'error': 'Training not found'}, status=400)

        timeslot.delete()
        return Response({'message': 'Timeslot deleted successfully'}, status=status.HTTP_200_OK)
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def generateTrainingPlan(request):
    # Define the response format
    response_format = """
    [
        [
            {
                "startTime": "YYYY-MM-DD HH:MM:SS",
                "endTime": "YYYY-MM-DD HH:MM:SS",
                "daygoal": "goal"
            },
            [
                {
                    "exercise": "name",
                    "repetitions": 10, 
                    "sets": 3           
                },
                {
                    "exercise": "name",
                    "repetitions": 10,  
                    "sets": 3          
                }
            ]
        ]
    ]
    """
    # Set OpenAI API key
    openai.api_key = "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"
    current_date = datetime.now().date()
    age = current_date.year - request.user.dateOfBirth.year - (
            (current_date.month, current_date.day) < (request.user.dateOfBirth.month, request.user.dateOfBirth.day))
    current_datetime = datetime.now()
    nearest_sunday = current_datetime + timedelta(days=(6 - current_datetime.weekday() + 7) % 7)
    if current_datetime.date() == nearest_sunday.date():
        nearest_sunday = nearest_sunday + timedelta(days=7)
    if current_datetime.time() > time(20, 0):
        current_datetime = current_datetime + timedelta(days=1)

    query = Q(date__gte=current_datetime.date(), date__lte=nearest_sunday.date())
    availability_query = AvailabilityTimeslot.objects.filter(query, userId=request.user.id)
    availability_string = ""
    for available in availability_query:
        availability_string += (f" [date: {available.date}, startTime: {available.startTime},"
                                f" endTime: {available.endTime}] ")
    # Call OpenAI API
    try:
        training_data = openai.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system",
                 "content": "You are a gym coach in the application named GymMate. "
                            "The repetitions and sets fields should be explicitly in number only"},
                {"role": "user",
                 "content": "Come up with a training plan for me. You have to select the best time, consider that "
                            "I am available " + availability_string + ". Name exercises"
                                                                      "that i should do and number of repetitions and number of sets, considering that I am "
                            + str(age) + " years old and my weight is " + str(request.user.weight) +
                            " kg and height is " + str(request.user.height) + "cm and my goal is " + str(
                     request.user.goal) + " The repetitions and sets fields should be explicitly in number only"
                                          "You have to format your response like that: " + response_format}
            ]
        )

        # Parse the JSON response
        data = json.loads(training_data.choices[0].message.content)
        # Process each training session
        for training_session in data:
            training_info = training_session[0]  # First element: training details
            exercises = training_session[1]  # Second element: list of exercises

            # Create Training object
            training = Training(
                userId=request.user,
                start_time=timezone.make_aware(datetime.strptime(training_info['startTime'], '%Y-%m-%d %H:%M:%S')),
                end_time=timezone.make_aware(datetime.strptime(training_info['endTime'], '%Y-%m-%d %H:%M:%S')),
                day_goal=training_info['daygoal'],
                done=False
            )
            training.save()

            # Create Exercise objects
            for exercise_info in exercises:
                exercise = Exercise(
                    training=training,
                    name=exercise_info['exercise'],
                    repetitions=exercise_info['repetitions'],
                    sets=exercise_info['sets']
                )
                exercise.save()

        return JsonResponse({"message": "Data saved successfully"})

    except json.JSONDecodeError as e:
        return Response({"status": "error", "message": f"Invalid JSON: {e}"}, status=400)
    except Exception as e:
        return Response({"status": "error", "message": str(e)}, status=400)


@api_view(['POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def update_training(request):
    # Deserialize the incoming data
    serializer = TrainingUpdateSerializer(data=request.data)

    # Validate the data
    if serializer.is_valid():
        training_id = serializer.validated_data['trainingId']

        # Retrieve the training instance
        try:
            training_instance = Training.objects.get(pk=training_id)
            if training_instance.userId != request.user.id:
                return Response({"error": "You are trying to change not your training"}, status=400)
        except Training.DoesNotExist:
            return Response({'error': 'Training not found'}, status=400)

        # Update the training instance using serializer
        try:
            updated_training = serializer.update(training_instance, serializer.validated_data)

            # Use the correct attribute for the primary key
            training_id = getattr(updated_training, 'training_id', None) or updated_training.pk

            return Response({
                'message': 'Training updated successfully',
                'training': {
                    'trainingId': training_id,
                    'startTime': updated_training.start_time.strftime('%Y-%m-%d %H:%M:%S'),
                    'endTime': updated_training.end_time.strftime('%Y-%m-%d %H:%M:%S')
                }
            }, status=status.HTTP_200_OK)

        except Exception as e:
            return Response({"status": "error", "message": str(e)}, status=400)

    else:
        # Return validation errors
        return Response(serializer.errors, status=400)


@api_view(['DELETE'])
def delete_training(request):
    serializer = TrainingDeleteSerializer(data=request.data)
    if serializer.is_valid():
        training_id = serializer.validated_data['trainingId']
        training = Training.objects.get(training_id=training_id)
        training.delete()
        return Response({'message': 'Training deleted successfully'}, status=status.HTTP_200_OK)
    else:
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET', 'POST'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def chat_list_create(request):
    if request.method == 'GET':
        chats = Chat.objects.filter(userId=request.user.id)
        serializer = ChatSerializer(chats, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        openai.api_key = "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"

        user_message = request.data['prompt']

        completion = openai.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system",
                 "content": "You are a gym assistant that gives a very short answers to the questions connected to "
                            " the gym exercises and you are in the app named GymMate"},
                {"role": "user", "content": user_message}
            ]
        )

        gpt_response = str(completion.choices[0].message.content).replace("\n", " ")

        # Save user's message to the chat
        user_chat = Chat(userId=request.user, sender=True, message=user_message, timestamp=timezone.now())
        user_chat.save()

        # Save GPT's response to the chat
        gpt_chat = Chat(userId=request.user, sender=False, message=gpt_response, timestamp=timezone.now())
        gpt_chat.save()

        return Response({"response": gpt_response}, status=status.HTTP_200_OK)



