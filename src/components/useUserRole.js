import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from "./config";
import { FRONTEND_URL } from "./config";

export const useUserRole = () => {
  const [userData, setUserData] = useState({
    rol: null,
    pendingTasks: null,
    userId: null,
    username: null,
    loading: true
  });

  const extractUserData = (user) => {
    try {
      // 1. Obtener pendingTasks del localStorage o del usuario
      let pendingTasks = localStorage.getItem('pendingTasks') === 'true' || user?.pendingTasks || false;

      // 2. Obtener rol EXCLUSIVAMENTE de localStorage (que viene de completedData.IdAdmin)
      let rol = localStorage.getItem('rol') || 'User';
      let username = localStorage.getItem('idAdminKey') || 'default';


      return {
        rol,
        pendingTasks,
        userId: user?.id,
        username,
        loading: false
      };

    } catch (error) {
      console.error('[useUserRole] Error:', error);
      return {
        rol: 'User',
        pendingTasks: false,
        userId: null,
        username: 'default',
        loading: false
      };
    }
  };

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken');
        const userId = localStorage.getItem('userId');

        if (!accessToken || !userId) {
          setUserData(prev => ({ ...prev, loading: false }));
          return;
        }

        const response = await axios.get(
          `${API_BASE_URL}/users/${userId}`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );

        const { rol, pendingTasks, username } = extractUserData(response.data);

        setUserData({
          rol,
          pendingTasks,
          userId,
          username,
          loading: false
        });
      } catch (error) {
        console.error('Error fetching user data:', error);
        setUserData(prev => ({ ...prev, loading: false }));
      }
    };

    fetchUserData();
  }, []);

  return userData;
};