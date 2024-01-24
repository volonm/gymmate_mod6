import * as React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaDumbbell } from "react-icons/fa6";
import { IoChatbubblesOutline } from "react-icons/io5";
import { FaUser } from "react-icons/fa";
import '../styles/NavBar.css';

const BottomNavBar: React.FC = () => {
  const location = useLocation();

  // Function to determine if a link is active
  const isActiveLink = (path: string) => location.pathname === path;

  return (
    // <Nav className="navbar-bottom">
    //     <Link to="/chat" className={`home-tab ${isActiveLink('/chat') ? 'active' : ''}`}>
    //       <IoChatbubblesOutline />
    //     </Link>
    //     <Link to="/schedule" className={`wallet-tab ${isActiveLink('/schedule') ? 'active' : ''}`}>
    //       <FaDumbbell />
    //     </Link>
    //     <Link to="/profile" className={`settings-tab ${isActiveLink('/profile') ? 'active' : ''}`}>
    //       <FaUser />
    //     </Link>
    // </Nav>
    <nav className="navbar-bottom">
        <div className='navbar-icon'>
          <Link to="/chat" className={`home-tab ${isActiveLink('/chat') ? 'active' : ''}`}>
            <IoChatbubblesOutline />
          </Link>
        </div>
        <div className='navbar-icon'>
          <Link to="/" className={`wallet-tab ${isActiveLink('/schedule') ? 'active' : ''}`}>
            <FaDumbbell />
          </Link>
        </div>
        <div className='navbar-icon'>
          <Link to="/profile" className={`settings-tab ${isActiveLink('/profile') ? 'active' : ''}`}>
            <FaUser />
          </Link>
        </div>
    </nav>
  );
};

export default BottomNavBar;
