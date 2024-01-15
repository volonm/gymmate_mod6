import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SharedForm from "./SharedForm.tsx";
import 'bootstrap/dist/css/bootstrap.min.css';

const LoginPage: React.FC = () => {
  const [username, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prepare the payload
    const formData = new FormData();
    formData.append('username', username);
    formData.append('password', password);

    try {
      // Send the POST request
      const response = await fetch('https://gymmate.pythonanywhere.com/auth/login', {
        method: 'POST',
        body: formData,
      });

      if (response.status === 200) {
        // Login successful, get the token
        const data = await response.json();
        const token = data.token;
        localStorage.setItem('token', token);
        console.log('Login successful! Token:', token);
        console.log(data);

        // Use history.push to navigate to the Schedule page
        navigate('/schedule');
      } else {
        console.log('Something went wrong. Status:', response.status);
      }
    } catch (error) {
      console.error('Error during login:', error);
    }
  };

  return (
    <SharedForm title="Mobile Login Page" onSubmit={handleSubmit} linkText="Don't have an account?" to="/register" buttonText="Login">
      <div className="mb-3">
        <label className="form-label">Username:</label>
        <input
          type="text"
          className="form-control"
          value={username}
          onChange={(e) => setEmail(e.target.value)}
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
    </SharedForm>
  );
};

export default LoginPage;
