import * as React from 'react';
import {useState, useEffect} from 'react';
import BottomNavBar from "../components/BottomNavBar.tsx";
import "../styles/ProfilePage.css"

interface UserProfile {
    name: string;
    lastname: string;
    username: string;
    dateOfBirth: string;
    weight: number;
    height: number;
    goal: string;
}

const ProfilePage: React.FC = () => {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [editing, setEditing] = useState(false); // State to control editing mode
    const [updatedProfileData, setUpdatedProfileData] = useState<UserProfile | null>(null);


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
            setUpdatedProfileData(data)
            ; // Set initial data for editing
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

            if (updatedProfileData && profile) {
                // Prepare data for update, use profile data if updated data is empty
                const dataToUpdate = {
                    name: updatedProfileData.name || profile.name,
                    lastname: updatedProfileData.lastname || profile.lastname,
                    username: updatedProfileData.username || profile.username,
                    dateOfBirth: updatedProfileData.dateOfBirth || profile.dateOfBirth,
                    weight: updatedProfileData.weight || profile.weight,
                    height: updatedProfileData.height || profile.height,
                    goal: updatedProfileData.goal || profile.goal,
                };

                // Send updated data to the server for profile update
                const response = await fetch(updateUserUrl, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Token ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(dataToUpdate)
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
        const {name, value} = event.target;

        // Update the updatedProfileData with new value or an empty string
        setUpdatedProfileData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };
    if (!profile || !imageUrl) {
        return <div>Loading profile and image...</div>;
    }


    function handleEditPhoto(): void {
        setEditing(true);
        const element = document.querySelector('.img-profile');
        const element2 = document.querySelector('.btn-profile-img');
        if (element) {
            element.className += '-edit';
        }
        if(element2){
            element2["style"].display = 'block';
        }

    }

    function handleEditPhotoStop(): void {
        setEditing(false);
        const element = document.querySelector('.img-profile-edit');
        const element2 = document.querySelector('.btn-profile-img');
        if (element) {
            element.className = 'img-profile';
        }
        if(element2){
            element2["style"].display = 'none';
        }
        handleUpdateProfile();
    }

    function handleEditPhotoCancel(): void {
        setEditing(false);
        const element = document.querySelector('.img-profile-edit');
        const element2 = document.querySelector('.btn-profile-img');
        if (element) {
            element.className = 'img-profile';
        }
        if(element2){
            element2["style"].display = 'none';
        }
    }

    return (
        <div className="root-page">
            {editing ? (
                <div className="EditButton">
                    <button onClick={handleEditPhotoStop} className="save-btn">Save</button>
                    <button onClick={() => handleEditPhotoCancel()} className="cancel-btn">Cancel</button>
                </div>
            ) : (
                <div className="EditButton">
                    <button onClick={() => handleEditPhoto()} className="edit-btn">Edit</button>
                </div>
            )}

            <div className="img-circle">
                <label htmlFor="imageInput" className="btn-profile-img">Change Profile Image</label>
                <img src={imageUrl} alt="User" className="img-profile"/>

            </div>
            <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{display: 'none'}}
                id="imageInput"
            />
            <h1 className="username-label">@{profile.username} </h1>
            <ul className="list-group">
                <li className="list-group-item">
                    {editing ? (
                        <input
                            type="text"
                            name="name"
                            placeholder="Name"
                            value={updatedProfileData?.name || ''}
                            onChange={handleInputChange}
                            className="form-control"/>
                    ) : (
                        <>
                            <strong>Name:</strong>
                            <span className="profile-data">{profile.name}</span>
                        </>)}
                </li>
                <li className="list-group-item">
                    {editing ? (
                        <input type="text" name="lastname" value={updatedProfileData?.lastname || ''}
                               onChange={handleInputChange} className="form-control" placeholder="Lastname"/>
                    ) : (
                        <>
                            <strong>Lastname:</strong>
                            <span className="profile-data">{profile.lastname}</span>
                        </>
                    )}
                </li>
                <li className="list-group-item">
                    {editing ? (
                        <input type="text" name="username" value={updatedProfileData?.username || ''}
                               onChange={handleInputChange} className="form-control" placeholder="Username"/>
                    ) : (<>
                            <strong>Username:</strong>
                            <span className="profile-data">{profile.username}</span>
                        </>
                    )}
                </li>
                <li className="list-group-item">
                    {editing ? (
                        <input type="text" name="dateOfBirth"
                               value={updatedProfileData?.dateOfBirth || ''}
                               onChange={handleInputChange} className="form-control" placeholder="2003-10-06"/>
                    ) : (
                        <>
                            <strong>Date of Birth:</strong>
                            <span className="profile-data">{profile.dateOfBirth}</span>
                        </>
                    )}
                </li>
                <li className="list-group-item">
                    {editing ? (
                        <input type="text" name="weight" value={updatedProfileData?.weight || ''}
                               onChange={handleInputChange} className="form-control" placeholder="Weigth in kg"/>
                    ) : (
                        <>
                            <strong>Weight:</strong>
                            <span className="profile-data">{profile.weight} kg</span>
                        </>
                    )}
                </li>
                <li className="list-group-item">
                    {editing ? (
                        <input type="text" name="height" value={updatedProfileData?.height || ''}
                               onChange={handleInputChange} className="form-control" placeholder="Height in cm"/>
                    ) : (
                        <>
                            <strong>Height:</strong>
                            <span className="profile-data">{profile.height} cm</span>
                        </>
                    )}
                </li>
                <li className={"list-group-item" || "goal-li"}>
                    {editing ? (
                        <input type="text" name="goal" value={updatedProfileData?.goal || ''}
                               onChange={handleInputChange} className="form-control"
                               placeholder="Train 2-3 times a week and gain muscle"/>
                    ) : (
                        <>
                            <strong>Goal:</strong>
                            <div className="form-control-goal">{profile.goal}</div>
                        </>
                    )}
                </li>
            </ul>
            {/* Include the BottomNavBar component */}
            <BottomNavBar/>
        </div>

    );
};

export default ProfilePage;