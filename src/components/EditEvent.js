import axios from 'axios';
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import Sidebar from './Sidebar';
import Footer from './Footer';
import LogoUser from './LogoUser';
import './CSS/EditEvent.css';
import { API_BASE_URL } from "./config";
import { FRONTEND_URL } from "./config";

const endpoint = `${API_BASE_URL}/events`;
const servicesEndpoint = `${API_BASE_URL}/services`;
const usersEndpoint = `${API_BASE_URL}/users`;
const username = localStorage.getItem('idAdminKey');


const EditEvent = () => {
  const [eventData, setEventData] = useState({
    title: '',
    start: '',
    end: '',
    employee: '',
    payrollValue: 0,
    servicesValue: 0,
    done: false,
  });
  const [services, setServices] = useState([]);
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();
  const { id } = useParams();
  const [filteredUsers, setFilteredUsers] = useState([]);
  const formattedDate = eventData.start ? dayjs(eventData.start).format('YYYY-MM-DD') : 'Fecha no seleccionada';
  const [clientPart, setClientPart] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventResponse, servicesResponse, usersResponse] = await Promise.all([
          axios.get(`${endpoint}/${id}`),
          axios.get(servicesEndpoint),
          axios.get(usersEndpoint),
        ]);

        // Extraer la parte del cliente del título original
        const clientPart = eventResponse.data.title.includes('/Client:')
          ? `/Client:${eventResponse.data.title.split('/Client:')[1]}`
          : '';
        setClientPart(clientPart); // Guardar la parte del cliente

        setEventData(eventResponse.data);
        setServices(servicesResponse.data);
        setUsers(usersResponse.data);
        // Filtrar usuarios basados en el username
        const filtered = usersResponse.data.filter(user => {
          const skills = user.skills?.[0]?.IdAdmin;
          return skills && skills[username] && skills[username]?.rol !== "User"; // Verifica si el username coincide
        });
        setFilteredUsers(filtered); // Guardar los usuarios filtrados
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, [id, username]);

  // Filtrar servicios basados en el username
  const filteredServices = services.filter(service => {
    return service.name.includes(`/${username}`);
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    if (name === 'title') {
      // Busca el servicio seleccionado
      const selectedService = services.find(service => service.name === value);

      if (selectedService) {
        setEventData({
          ...eventData,
          [name]: value, // Usa el nuevo título sin la parte del cliente
          payrollValue: selectedService.payrollValue,
          servicesValue: selectedService.price,
        });
      } else {
        setEventData({
          ...eventData,
          [name]: value, // Usa el nuevo título sin la parte del cliente
          payrollValue: 0,
          servicesValue: 0,
        });
      }
    } else if (name === 'start') {
      const newStart = value;
      const newEnd = dayjs(newStart).add(30, 'minute').format('YYYY-MM-DDTHH:mm');
      setEventData({ ...eventData, start: newStart, end: newEnd });
    } else {
      setEventData({ ...eventData, [name]: value });
    }
  };

  const update = async (e) => {
    e.preventDefault();

    // Verificar si el título ya contiene la parte del cliente
    const titleAlreadyHasClient = eventData.title.includes(clientPart);

    // Concatenar la parte del cliente solo si no está ya presente
    const newTitle = titleAlreadyHasClient ? eventData.title : `${eventData.title}${clientPart}`;


    try {
  await axios.put(`${endpoint}/${id}`, {
    ...eventData,
    title: newTitle, // Usa el nuevo título con la parte del cliente (si no estaba ya presente)
  });
  navigate(`/${username}/calendar`);
} catch (error) {
  if (error.response) {
    // Error que viene del servidor (Laravel/Postgres)
    console.error('Error response:', {
      status: error.response.status,
      data: error.response.data,
      headers: error.response.headers,
    });
  } else if (error.request) {
    // No hubo respuesta del servidor
    console.error('No response received:', error.request);
  } else {
    // Error al configurar la petición
    console.error('Request setup error:', error.message);
  }
  console.error('Config:', error.config);
}

  };

  return (
    <div className='Container-Container-calendarEditEvent'>
      <Sidebar />
      <div className='Container-calendarEditEvent2'>
        <br></br>
        <h3 style={{ color: '#090027' }}>Editar Cita en:</h3>
        <br></br>
        <LogoUser />
        <br></br>
        <h3 style={{ color: '#090027' }}>Fecha seleccionada para la cita: {formattedDate}</h3>
        <br></br>
        <form className='calendarEditEvent' onSubmit={update}>
          <div className='mb-3'>
            <label className='form-label' style={{ color: '#090027' }}>Servicio</label>
            <select
              value={eventData.title} // Mantén el título completo aquí
              onChange={handleInputChange}
              name='title'
              className='form-control'
            >
              <option value='' disabled>Seleccione un servicio</option>
              {filteredServices.map(service => (
                <option key={service.id} value={service.name}> {/* Usa el nombre completo como valor */}
                  {service.name.split('/')[0]} {/* Muestra solo la parte relevante */}
                </option>
              ))}
            </select>
          </div>
          <div className='mb-3'>
            <label className='form-label' style={{ color: '#090027' }}>Cita</label>
            <input
              value={eventData.start}
              onChange={handleInputChange}
              name='start'
              type='datetime-local'
              className='form-control'
            />
          </div>
          <div className='mb-3'>
            <label className='form-label' style={{ color: '#090027' }}>Empleado</label>
            <select
              value={eventData.employee}
              onChange={handleInputChange}
              name='employee'
              className='form-control'
            >
              <option value="" disabled>Seleccione un empleado</option>
              {filteredUsers.map(user => (
                <option key={user.id} value={user.name}>
                  {user.name}
                </option>
              ))}
            </select>
          </div>
          <div className='mb-3'>
            <label className='form-label' style={{ color: '#090027' }}>Valor Empleado</label>
            <input
              value={eventData.payrollValue}
              onChange={handleInputChange}
              name='payrollValue'
              type='number'
              className='form-control'
              readOnly
            />
          </div>
          <div className='mb-3'>
            <label className='form-label' style={{ color: '#090027' }}>Valor Servicio</label>
            <input
              value={eventData.servicesValue}
              onChange={handleInputChange}
              name='servicesValue'
              type='number'
              className='form-control'
              readOnly
            />
          </div><br></br>

          <button
            type='submit'
            className="neumorphic-btn submit-btn"
            onClick={(e) => {
              const confirmationMessage = `¿Estás seguro de que deseas Agendar la cita?`;
              if (!window.confirm(confirmationMessage)) {
                e.preventDefault();
              }
            }}
          >
            Agendar Cita
          </button><br></br>
          <button
            type="button"
            className="neumorphic-btn cancel-btn"
            onClick={() => navigate(`/${username}/calendar`)}
          >
            Cancelar
          </button><br></br><br></br>
        </form>
      </div>

      <Footer />
    </div>


  );
};

export default EditEvent;