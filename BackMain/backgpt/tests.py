import requests

url = "http://127.0.0.1:8000/auth/reg"

# Form data
payload = {
    "username": "Ton233y",
    "password": "hawk",
    "email": "hello@gmail.com",
    "dateOfBirth": "2003-10-23",
    "weight": 24412.0,
    "height": 222.24,
    "goal": "Women"
}

# Image file path
file_path = r"C:\Users\grech\Downloads\1700436239539.jpeg"

# Open the file in binary read mode
with open(file_path, 'rb') as file:
    files = {
        'image': (file_path, file, 'image/jpeg')  # Adjust MIME type if needed
    }

    # Make the POST request within the 'with' block
    response = requests.post(url, data=payload, files=files)

# Print response outside the 'with' block
print(response.status_code)
print(response.text)
