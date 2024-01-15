import * as React from 'react';
import { useState, useEffect } from 'react';


interface UserProfile {
  name: string;
  lastname: string;
  username: string;
  dateOfBirth: string;
  weight: number;
  height: number;
  goal: string;
}
   const initialUserProfile: UserProfile = {
    name: '',
    lastname: '',
    username: '',
    dateOfBirth: '',
    weight: 0,
    height: 0,
    goal: '',
  };

const ProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const [editing, setEditing] = useState(false); // State to control editing mode
  const [updatedProfileData, setUpdatedProfileData] = useState<UserProfile>(initialUserProfile);


  const fetchProfile = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch('https://gymmate.pythonanywhere.com/api/getUserInfo', {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      setProfile(data);
      setUpdatedProfileData(data); // Set initial data for editing
      fetchImage();
    } catch (error) {
      console.error('Error fetching profile data:', error);
    }
  };

  const fetchImage = async () => {
    const token = localStorage.getItem('token');
    try {
      const baseUrl = 'https://gymmate.pythonanywhere.com'; // Base URL
      const imageUrlResponse = await fetch(`${baseUrl}/api/getUserImage`, {
        method: 'GET',
        headers: {
          'Authorization': `Token ${token}`
        }
      });

      if (!imageUrlResponse.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await imageUrlResponse.json();
      const imageRelativePath = data.image;
      const fullImageUrl = baseUrl + imageRelativePath;
      setImageUrl(fullImageUrl);
    } catch (error) {
      console.error('Error fetching image:', error);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleImageChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];

    if (selectedFile) {
      const token = localStorage.getItem('token');
      try {
        const baseUrl = 'https://gymmate.pythonanywhere.com';
        const updateImageUrl = `${baseUrl}/api/setUserImage`;

        // Prepare the form data for image upload
        const formData = new FormData();
        formData.append('image', selectedFile);

        // Send the image update request
        const imageUpdateResponse = await fetch(updateImageUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Token ${token}`,
          },
          body: formData,
        });

        if (!imageUpdateResponse.ok) {
          throw new Error('Error updating user image');
        }

        // If the image update is successful, update the imageURL state
        const imageUrlResponse = await fetch(`${baseUrl}/api/getUserImage`, {
          method: 'GET',
          headers: {
            'Authorization': `Token ${token}`,
          },
        });

        if (!imageUrlResponse.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await imageUrlResponse.json();
        const imageRelativePath = data.image;
        const fullImageUrl = baseUrl + imageRelativePath;
        setImageUrl(fullImageUrl);
      } catch (error) {
        console.error('Error updating user image:', error);
      }
    }
  };

  const handleUpdateProfile = async () => {
    const token = localStorage.getItem('token');
    try {
      const baseUrl = 'https://gymmate.pythonanywhere.com'; // Base URL
      const updateUserUrl = `${baseUrl}/api/setUserInfo`;

      if (updatedProfileData) {

        // Send updatedProfileData to the server for profile update
        const response = await fetch(updateUserUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Token ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(updatedProfileData)
        });

        if (!response.ok) {
          throw new Error('Error updating user data');
        }

        // After a successful update, exit editing mode
        setEditing(false);

        // Fetch the updated profile data
        fetchProfile();
      }
    } catch (error) {
      console.error('Error updating user data:', error);
    }
  };

  // Function to handle input changes in editable fields
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    // Create a new object that merges the edited field with the current data
    if (updatedProfileData) {
      setUpdatedProfileData((prevData) => ({
        ...prevData,
        [name]: value
      }));
    }
  };

  if (!profile || !imageUrl) {
    return <div>Loading profile and image...</div>;
  }

  return (
    <div className="container">
      <h1>User Profile</h1>
      <img src={imageUrl} alt="User" className="profile-image" />
      <input
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        style={{ display: 'none' }}
        id="imageInput"
      />
      <button
        onClick={() => document.getElementById('imageInput')?.click()}
        className="image-button"
      >
        Change Profile Image
      </button>
      <p>Name: {editing ? <input type="text" name="name" value={updatedProfileData?.name || profile.name} onChange={handleInputChange} /> : profile.name}</p>
      <p>Lastname: {editing ? <input type="text" name="lastname" value={updatedProfileData?.lastname || profile.lastname} onChange={handleInputChange} /> : profile.lastname}</p>
      <p>Username: {editing ? <input type="text" name="username" value={updatedProfileData?.username || profile.username} onChange={handleInputChange} /> : profile.username}</p>
      <p>Date of Birth: {editing ? <input type="text" name="dateOfBirth" value={updatedProfileData?.dateOfBirth || profile.dateOfBirth} onChange={handleInputChange} /> : profile.dateOfBirth}</p>
      <p>Weight: {editing ? <input type="text" name="weight" value={updatedProfileData?.weight || profile.weight} onChange={handleInputChange} /> : profile.weight} kg</p>
      <p>Height: {editing ? <input type="text" name="height" value={updatedProfileData?.height || profile.height} onChange={handleInputChange} /> : profile.height} cm</p>
      <p>Goal: {editing ? <input type="text" name="goal" value={updatedProfileData?.goal || profile.goal} onChange={handleInputChange} /> : profile.goal}</p>

      {editing ? (
        <div>
          <button onClick={handleUpdateProfile} className="save-button">Save Changes</button>
          <button onClick={() => setEditing(false)} className="cancel-button">Cancel</button>
        </div>
      ) : (
        <button onClick={() => setEditing(true)} className="edit-button">Edit Profile</button>
      )}
    </div>
);
};

export default ProfilePage;