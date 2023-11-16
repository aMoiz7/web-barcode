import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './sidebar';


const Dashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const isAuthenticated = async () => {
      try {
        const token = localStorage.getItem('token');
        
        const headers = {
          Authorization: `Bearer ${token}`,
        };
        
        const response = await fetch('/api/admin/dashboard', {
          headers,
        });

        if (response.ok) {
          const data = await response.text();
          console.log(data);
        } else {
          // Handle non-successful response
          throw new Error('Request failed with status ' + response.status);
        }
      } catch (error) {
        console.error(error);
        navigate('/admin/');
      }
    };
    
    isAuthenticated();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/admin/');
  };

  

  return (
    
    <div>
      
      <h1>Dashboard</h1>
      <p>Welcome to the dashboard!</p>
      
      <button onClick={handleLogout}>Logout</button>



      
    </div>
  );
};

export default Dashboard;
