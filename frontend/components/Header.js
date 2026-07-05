import React from 'react';
import { useSelector } from 'react-redux';

const Header = () => {
  const user = useSelector((state) => state.user);

  if (user.role === 'admin') {
    return (
      <div>
        <h1>Admin Dashboard</h1>
        {/* render admin links */}
      </div>
    );
  } else if (user.role === 'moderator') {
    return (
      <div>
        <h1>Moderator Dashboard</h1>
        {/* render moderator links */}
      </div>
    );
  } else {
    return (
      <div>
        <h1>User Dashboard</h1>
        {/* render user links */}
      </div>
    );
  }
};

export default Header;