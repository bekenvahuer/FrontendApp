import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import Sidebar from './Sidebar';
import Footer from './Footer';
import LogoUser from './LogoUser';
import './CSS/ShowServices.css';
import { API_BASE_URL } from "./config";
import { FRONTEND_URL } from "./config";

const endpoint = `${API_BASE_URL}`;

const ShowServices = () => {
  const [services, setServices] = useState([]);
  const username = localStorage.getItem('idAdminKey');

  useEffect(() => {
    getAllServices();
  }, []);

  const getAllServices = async () => {
    try {
      const response = await axios.get(`${endpoint}/services`);
      const filteredServices = response.data.filter(service =>
        service.name.includes(`/${username}`)
      );
      setServices(filteredServices); // Guardar los servicios filtrados
    } catch (error) {
      console.error('Error fetching services:', error);
    }
  };

  const deleteService = async (id) => {
    try {
      await axios.delete(`${endpoint}/service/${id}`);
      getAllServices(); // Actualizar la lista de servicios después de eliminar
    } catch (error) {
      console.error('Error deleting service:', error);
    }
  };

  return (
    <div className='Container-calendarShowServices'>
      <Sidebar />
      <div className='Container-calendarShowServices2'>
        <br></br>
        <h2 style={{ color: '#090027' }}>Servicios</h2>
        <br></br>
        <LogoUser />
        <br></br>
        <div className='d-grid gap-2'>
          <Link
            to={`/${username}/services/create`}
            className='neumorphic-btn btn btn-lg mt-2 mb-2'
          >
            <span>Crear Servicio</span>
          </Link>
        </div>
        <br></br>
      </div>

      <div className="neumorphic-table-container">
        <table className='neumorphic-table'>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Descripcion</th>
              <th>Valor</th>
              <th>Valor Nomina</th>
              <th>Accion</th>
            </tr>
          </thead>
          <tbody>
            {services.map((service) => (
              <tr key={service.id}>
                <td>{service.name.split('/')[0]}</td>
                <td>{service.description}</td>
                <td>{service.price}</td>
                <td>{service.payrollValue}</td>
                <td>
                  <div className="action-buttons">
                    <Link
                      to={`/${username}/services/edit/${service.id}`}
                      className='action-btn btn-warning'
                    >
                      <FaEdit />
                    </Link>
                    <button
                      onClick={() => {
                        if (window.confirm("¿Estás seguro de que deseas eliminar este Servicio?")) {
                          deleteService(service.id);
                        }
                      }}
                      className='action-btn btn-danger'
                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Footer />
    </div>
  );
};

export default ShowServices;