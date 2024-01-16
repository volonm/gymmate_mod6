// BottomNavBar.tsx

import * as React from 'react';
import { Link } from 'react-router-dom';
import { Navbar, Nav } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faUser, faComment } from '@fortawesome/free-solid-svg-icons';

const BottomNavBar: React.FC = () => {
  const iconStyle = { margin: '0 50px' }; // Adjust the margin as needed

  return (
    <Navbar fixed="bottom" bg="light" variant="light">
      <Nav className="mx-auto">
        <Link to="/chat" style={iconStyle}>
          <FontAwesomeIcon icon={faComment} /> {/* Home icon */}
        </Link>
        <Link to="/schedule" style={iconStyle}>
          <FontAwesomeIcon icon={faHome} /> {/* Star icon */}
        </Link>
        <Link to="/profile" style={iconStyle}>
          <FontAwesomeIcon icon={faUser} /> {/* Profile icon */}
        </Link>
      </Nav>
    </Navbar>
  );
};

export default BottomNavBar;
