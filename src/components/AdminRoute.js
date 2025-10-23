import { Navigate } from 'react-router-dom';
import React from 'react';

const AdminRoute = ({ children }) => {
  const checkAccess = () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user')) || {};
      const storedRole = localStorage.getItem('rol'); // Obtenemos el rol directamente de localStorage

      // Verificamos si es admin usando el rol almacenado
      const isAdmin = storedRole === 'Admin';
      const pendingTasks = localStorage.getItem('pendingTasks') === 'true';


      return isAdmin && !pendingTasks;
    } catch (error) {
      console.error('[AdminRoute] Error:', error);
      return false;
    }
  };

  return checkAccess() ? children : <Navigate to="/unauthorized" replace />;
};

export default AdminRoute;