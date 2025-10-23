import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaFilter } from 'react-icons/fa';
import Sidebar from './Sidebar';
import Footer from './Footer';
import LogoUser from './LogoUser';
import './CSS/ShowUsers.css';
import { API_BASE_URL } from "./config";
import { FRONTEND_URL } from "./config";

const endpoint = `${API_BASE_URL}`;

const ShowUsers = () => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const username = localStorage.getItem('idAdminKey'); // Mueve la declaración de username aquí


  useEffect(() => {
    getAllUsers();
  }, []);

  const getAllUsers = async () => {
    const response = await axios.get(`${endpoint}/users`);
    const usersWithSkills = response.data.filter(user => {
      const skills = user.skills?.[0]?.IdAdmin?.[username]; // Accede al primer elemento del array
      return skills; // Filtra usuarios que tengan skills para el username actual
    });

    setUsers(usersWithSkills);
    setFilteredUsers(usersWithSkills);
  };

  const deleteUser = async (id) => {
    await axios.delete(`${endpoint}/users/${id}`);
    getAllUsers();
  };

  return (
    <div className='Container-calendarShowUsers'>
      <Sidebar />
      <div className='Container-calendarShowUsers3'>
        <h2 style={{ color: '#090027' }}>Usuarios</h2>
        <br></br>
        <LogoUser />
        <div className='d-grid gap-2'>
          <Link to={`/${username}/users/create`} className='neumorphic-btn btn btn-lg mt-2 mb-2'>
            <FaPlus style={{ color: '#090027' }} />Agregar Empleado
          </Link>
        </div>
        <br></br>
      </div>
      <br></br>
      <div className="neumorphic-table-container">
        <table className='neumorphic-table'>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Email</th>
              <th>Cumpleaños</th>
              <th>Tel.</th>
              <th>Empleado</th>
              <th>Skills</th>
              <th>Accion</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => {
              const skills = user.skills?.[0]?.IdAdmin?.[username]?.skills; // Accede al primer elemento del array

              return (
                <tr key={user.id}>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>{user.date_of_birth}</td>
                  <td>{user.phone}</td>
                  <td>{user.employee ? 'Si' : 'No'}</td>
                  <td>
                    {skills && skills.filter(skill => skill !== 'null').length > 0
                      ? skills
                        .filter(skill => skill !== 'null') // Filtra primero los valores 'null'
                        .map(skill => skill.split('/')[0]) // Luego procesa los skills válidos
                        .join(', ')
                      : ''}
                  </td>
                  <td>
                    <div className="action-buttons">
                      {user.employee === 1 && (
                        <Link to={`/${username}/users/edit/${user.id}`} className='action-btn btn-warning'>
                          <FaEdit />
                        </Link>
                      )}
                      {user.employee === 1 && (
                        <button onClick={() => {
                          if (window.confirm("¿Estás seguro de que deseas eliminar este User?")) {
                            deleteUser(user.id);
                          }
                        }} className='action-btn btn-danger'>
                          <FaTrash />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <Footer />
    </div>
  );
};

export default ShowUsers;