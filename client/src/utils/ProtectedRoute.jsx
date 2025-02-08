/* eslint-disable react/prop-types */
import { Navigate, useLocation } from 'react-router-dom';
import NotFoundPage from '../pages/NotFoundPage';
import Cookies from 'js-cookie';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const userRole = Cookies.get('userRole');
  const location = useLocation();

  // Check if path exists in defined routes
  const validPaths = ['/manager', '/user'];
  const currentPath = location.pathname.split('/')[1];
  const isValidPath = validPaths.some(path => path === '/' + currentPath);

  if (!isValidPath) {
    return <NotFoundPage />;
  }

  if (!userRole) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(userRole)) {
    return <NotFoundPage />;
  }

  return children;
};

export default ProtectedRoute;