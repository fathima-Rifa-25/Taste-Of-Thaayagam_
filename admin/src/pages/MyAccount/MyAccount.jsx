import { useState, useEffect } from 'react';
import './MyAccount.css';

const MyAccount = () => {
  const [user, setUser] = useState({});

  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem('user')) || {};
      setUser(u);
    } catch (e) {
      setUser({});
    }
  }, []);

  return (
    <div className="page-container">
      <div className="list add">
        <h2>My Account</h2>
        <div className="myaccount-card">
          <p><strong>First Name:</strong> {user.firstName || (user.name ? (user.name.split(' ')[0]) : '')}</p>
          <p><strong>Last Name:</strong> {user.lastName || (user.name ? (user.name.split(' ').slice(1).join(' ')) : '')}</p>
          <p><strong>Email:</strong> {user.email || '-'}</p>
          <p><strong>Phone:</strong> {user.phone || '-'}</p>
        </div>
      </div>
    </div>
  );
};

export default MyAccount;
