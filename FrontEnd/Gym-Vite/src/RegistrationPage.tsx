// RegistrationPage.tsx

import * as React from 'react';
import { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import SharedForm from "./SharedForm.tsx";

const RegistrationPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [weight, setWeight] = useState(0);
  const [height, setHeight] = useState(0);
  const [goal, setGoal] = useState('');
  const [image, setImage] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prepare the payload
    const formData = new FormData();
    formData.append('email', email);
    formData.append('username', username);
    formData.append('password', password);
    formData.append('dateOfBirth', dateOfBirth);
    formData.append('weight', weight.toString());
    formData.append('height', height.toString());
    formData.append('goal', goal);
    if (image) {
      formData.append('image', image);
    }

    try {
      // Send the POST request
      const response = await fetch('https://gymmate.pythonanywhere.com/auth/reg', {
        method: 'POST',
        body: formData,
      });

      if (response.status === 200) {
        // Registration successful, get the token
        const data = await response.json();
        const token = data.token;
        console.log('Registration successful! Token:', token);

        // Store the token on the client side (e.g., in local storage or cookies)
        // Example: localStorage.setItem('token', token);

        // Reset the form fields
        setEmail('');
        setUsername('');
        setPassword('');
        setDateOfBirth('');
        setWeight(0);
        setHeight(0);
        setGoal('');
        setImage(null);
      } else if (response.status === 400) {
        console.log('User already exists. Please choose a different username or email.');
      } else {
        console.log('Something went wrong. Status:', response.status);
      }
    } catch (error) {
      console.error('Error during registration:', error);
    }
  };

  return (
    <SharedForm title="Mobile Registration Page" onSubmit={handleSubmit} linkText="Already have an account?" to="/" buttonText="Login">
      <div className="mb-3">
        <label className="form-label">Email:</label>
        <input
          type="email"
          className="form-control"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div className="mb-3">
        <label className="form-label">Username:</label>
        <input
          type="text"
          className="form-control"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>
      <div className="mb-3">
        <label className="form-label">Password:</label>
        <input
          type="password"
          className="form-control"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <div className="mb-3">
        <label className="form-label">Date of Birth:</label>
        <input
          type="date"
          className="form-control"
          value={dateOfBirth}
          onChange={(e) => setDateOfBirth(e.target.value)}
        />
      </div>
      <div className="mb-3">
        <label className="form-label">Weight:</label>
        <input
          type="number"
          className="form-control"
          value={weight}
          onChange={(e) => setWeight(Number(e.target.value))}
        />
      </div>
      <div className="mb-3">
        <label className="form-label">Height:</label>
        <input
          type="number"
          className="form-control"
          value={height}
          onChange={(e) => setHeight(Number(e.target.value))}
        />
      </div>
      <div className="mb-3">
        <label className="form-label">Goal:</label>
        <input
          type="text"
          className="form-control"
          value={goal}
          onChange={(e) => setGoal(e.target.value)}
        />
      </div>
      <div className="mb-3">
        <label className="form-label">Image:</label>
        <input
          type="file"
          className="form-control"
          accept="image/*"
          onChange={(e) => setImage(e.target.files?.[0] || null)}
        />
      </div>
    </SharedForm>
  );
};


export default RegistrationPage;
