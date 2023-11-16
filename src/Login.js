import { useState , useEffect  } from 'react';
import { useNavigate } from "react-router-dom";
import Scanner from './Scanner';
import './YourComponent.css';

import Cookies from 'js-cookie';

function ContactForm() {
  
  const navigate=useNavigate()
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');

  const handleSubmit = async (e) => {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"; 
    e.preventDefault();
   

    const response = await fetch('/api/customers', {
      method: 'POST',
      
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, phone }),
    });
    const data = await response.json();
    Cookies.set('jwt', data.jwt);
    navigate("/Scanner");
  
    // Check if a JWT token is already present in the browser's cookies
    const jwt = Cookies.get('jwt');
  
    // If a JWT token is present, redirect the user to the main page
    if (jwt) {
      navigate("/Scanner");
    } 
  };

  return (
    <div>

     
    <div className="centered-container">
     
    <form onSubmit={handleSubmit} className="styled-form">
    <h1 className="heading">Scan & Shop</h1>
      <div className="form-group">
        <label htmlFor="name">Name:</label>
        <input type="text" id="name" value={name} onChange={(event) => setName(event.target.value)} required />
      </div>
      <div className="form-group">
        <label htmlFor="phone">Phone:</label>
        <input type="text" id="phone" value={phone} onChange={(event) => setPhone(event.target.value)} required />
      </div>
      <label htmlFor="name"><h6>Concept & development by : Abdul Moiz Hussain</h6>
      <h6>Email : moizh750@gmail.com </h6>
      </label>
      <br />
      <button type="submit">Submit</button>
    </form>
  </div>
  </div>
  );
}


export default ContactForm;
