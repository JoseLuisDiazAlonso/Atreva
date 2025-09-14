import { Navigate } from 'react-router-dom';
import {jwtDecode} from 'jwt-decode';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');

  const isValidToken = () => {
    if (!token) return false;

    try {
      const decoded = jwtDecode(token);
      const now = Date.now() / 1000; // en segundos

      return decoded.exp && decoded.exp > now;
    } catch (err)  {
      console.error ("Token inválido", err);
      return false;
    }
  };

  return isValidToken() ? children : <Navigate to="/auth/login" />;
};

export default ProtectedRoute;
