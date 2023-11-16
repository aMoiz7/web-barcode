import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './Login';
import Scanner from './Scanner';
import jwtDecode from 'jwt-decode';
import Cookies from 'js-cookie';
import Admin from './routes/admin'
import  Payment  from './pages/payment';

const App = () => {
  const isLoggedIn = () => {
    const jwt = Cookies.get('jwt');
    if (jwt) {
      return true;
    }
    return false;
  };

  return (
    <Router>
      <Routes>
        <Route path="/Login" element={<Login />} />
        <Route path="/" element={isLoggedIn() ? <Navigate to="/Scanner" /> : <Navigate to="/Login" />} />
        {isLoggedIn() && <Route path="/Scanner" element={<Scanner />} />}
        <Route path="/Scanner" element={<Scanner />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/admin/*" element={<Admin />} />
      </Routes>
    </Router>
  );
};

export default App;
