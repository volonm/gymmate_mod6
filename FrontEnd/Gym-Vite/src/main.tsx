// main.tsx
import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import LoginPage from './LoginPage';
import RegistrationPage from './RegistrationPage';
import ChatRoom from "./ChatRoom.tsx";
import ProfilePage from "./ProfilePage.tsx";
import { BrowserRouter as Router,Route, Routes } from 'react-router-dom';
import TimetableContainer from "./TimetableContainer.tsx";
ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Router>
        <Routes>
            <Route path="/register" element={<RegistrationPage />} />
            <Route path="/" element={<LoginPage />} />
            <Route path="/chat/" element={<ChatRoom/>} />
            <Route path="/profile/" element={<ProfilePage/>} />
            <Route path="/schedule/" element={<TimetableContainer />} />
        </Routes>
    </Router>
  </React.StrictMode>,
);
