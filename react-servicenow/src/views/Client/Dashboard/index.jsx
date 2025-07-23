import React from 'react';
import { useSelector } from 'react-redux';
import { selectClientAuthEmail } from '../../../features/auth/client/auth';

const WelcomeMessage = () => {
  const userEmail = useSelector(selectClientAuthEmail);
  
  return (
    <div className="welcome-message">
      <h1>Hello{userEmail ? `, ${userEmail}` : ''}! Welcome to our app!</h1>
      <p>We're glad to have you here.</p>
      {userEmail && (
        <div className="user-info">
          <p>You're logged in as: <strong>{userEmail}</strong></p>
        </div>
      )}
    </div>
  );
};

export default WelcomeMessage;