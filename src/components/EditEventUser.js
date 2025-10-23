import axios from 'axios';
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import dayjs from 'dayjs';
import SidebarUser from './SidebarUser';
import LogoUser from './LogoUser';
import './CSS/EditEvent.css';
import { API_BASE_URL } from "./config";
import { FRONTEND_URL } from "./config";

const endpoint = `${API_BASE_URL}/events`;
const servicesEndpoint = `${API_BASE_URL}/services`;
const usersEndpoint = `${API_BASE_URL}/users`;

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

  const formattedDate = eventData.start ? dayjs(eventData.start).format('YYYY-MM-DD') : 'Fecha no seleccionada';

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventResponse, servicesResponse, usersResponse] = await Promise.all([
          axios.get(`${endpoint}/${id}`),
          axios.get(servicesEndpoint),
          axios.get(usersEndpoint),
        ]);
        setEventData(eventResponse.data);
        setServices(servicesResponse.data);
        setUsers(usersResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, [id]);

  const handleInputChange = e => {
    const { name, value } = e.target;
    if (name === 'title') {
      const selectedService = services.find(service => service.name === value);
      if (selectedService) {
        setEventData({
          ...eventData,
          [name]: value,
          payrollValue: selectedService.payrollValue,
          servicesValue: selectedService.price,
        });
      } else {
        setEventData({
          ...eventData,
          [name]: value,
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

  const update = async e => {
    e.preventDefault();
    try {
      await axios.put(`${endpoint}/${id}`, eventData);
      navigate('/calendarUser');
    } catch (error) {
      console.error('Error updating event:', error);
    }
  };

  return (
    <div className='Container-calendar'>
      <SidebarUser />
      <h3 style={{ color: '#090027', marginTop: '-100px' }}>Editar Cita en:</h3>
      <LogoUser />
      <h3 style={{ color: '#090027' }}>Fecha seleccionada: {formattedDate}</h3>
      <form onSubmit={update}>
        <div className='mb-3'>
          <label className='form-label'>Title</label>
          <select
            value={eventData.title}
            onChange={handleInputChange}
            name='title'
            className='form-control'
          >
            <option value='' disabled>Select a service</option>
            {services.map(service => (
              <option key={service.id} value={service.name}>
                {service.name}
              </option>
            ))}
          </select>
        </div>
        <div className='mb-3'>
          <label className='form-label'>Start</label>
          <input
            value={eventData.start}
            onChange={handleInputChange}
            name='start'
            type='datetime-local'
            className='form-control'
          />
        </div>
        <div className='mb-3'>
          <label className='form-label'>Employee</label>
          <select
            value={eventData.employee}
            onChange={handleInputChange}
            name='employee'
            className='form-control'
          >
            <option value='' disabled>Select an employee</option>
            {users.map(user => (
              <option key={user.id} value={user.name}>
                {user.name}
              </option>
            ))}
          </select>
        </div>
        <div className='mb-3'>
          <label className='form-label'>Payroll Value</label>
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
          <label className='form-label'>Services Value</label>
          <input
            value={eventData.servicesValue}
            onChange={handleInputChange}
            name='servicesValue'
            type='number'
            className='form-control'
            readOnly
          />
        </div>

        <button type='submit' className="btn btn-secondary mb-3" style={{ backgroundColor: '#a27014' }}>
          Update
        </button>
      </form>
    </div>
  );
};

export default EditEvent;
