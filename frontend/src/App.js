import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Dashboard from './Dashboard';
import Login from './Login';

export default function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Configure axios to always send the token if it exists
  if (token) {
    axios.defaults.headers.common['x-auth-token'] = token;
  } else {
    delete axios.defaults.headers.common['x-auth-token'];
  }

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('token');
  };

  return (
    <div>
      {token ? <Dashboard logout={handleLogout} /> : <Login setToken={setToken} />}
    </div>
  );
}