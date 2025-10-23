import axios from 'axios';
import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import dayjs from 'dayjs';
import Sidebar from './Sidebar';
import Footer from './Footer';
import LogoUser from './LogoUser';
import './CSS/CreateEvent.css';
import { name } from 'dayjs/locale/es';
import { API_BASE_URL } from "./config";

const endpoint = `${API_BASE_URL}/events`;
const servicesEndpoint = `${API_BASE_URL}/services`;
const usersEndpoint = `${API_BASE_URL}/users`;

const CreateEvent = () => {
  const location = useLocation();
  const { start: initialStart } = location.state || {};
  const formattedDate = initialStart ? dayjs(initialStart).format('YYYY-MM-DD') : 'Fecha no seleccionada';

  const [title, setTitle] = useState('');
  const [employee, setEmployee] = useState('');
  const [selectedHour, setSelectedHour] = useState('');
  const [done, setDone] = useState(false);
  const [services, setServices] = useState([]);
  const [users, setUsers] = useState([]);
  const [reservedEvents, setReservedEvents] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const navigate = useNavigate();

  // Obtener el username del localStorage
  const username = localStorage.getItem('idAdminKey') || 'usuario';
  const username2 = localStorage.getItem("user");
  const userObject = JSON.parse(username2);
  const username3 = userObject.name;



  useEffect(() => {
    const fetchData = async () => {
      try {
        const [servicesResponse, usersResponse, eventsResponse] = await Promise.all([
          axios.get(servicesEndpoint),
          axios.get(usersEndpoint),
          axios.get(endpoint),
        ]);

        setServices(servicesResponse.data);
        setUsers(usersResponse.data);

        const events = eventsResponse.data.map(event => {
          return {
            start: event.start, // <-- No se aplica formateo
            employee: event.employee,
          };
        });

        setReservedEvents(events);
      } catch (error) {
        console.error("Error al cargar datos:", error);
      }
    };

    fetchData();
  }, []);

  // Generar rangos de 30 minutos desde 08:00 AM hasta 08:00 PM
  const timeSlots = useMemo(() => {
    const slots = [];
    let startTime = dayjs().hour(8).minute(0);
    const endTime = dayjs().hour(20).minute(0);

    while (startTime.isBefore(endTime)) {
      slots.push(startTime.format('HH:mm'));
      startTime = startTime.add(30, 'minute');
    }
    return slots;
  }, []);

  // Calcular las horas disponibles según los eventos reservados
  const getAvailableHours = useMemo(() => {
    return timeSlots.filter(hour => {
      const selectedDateTime = dayjs(`${formattedDate} ${hour}:00`); // Creamos la fecha completa usando dayjs

      return !reservedEvents.some(event => {
        const eventStart = dayjs(event.start); // Convertimos la fecha del evento usando dayjs
        return eventStart.isSame(selectedDateTime, 'minute') && event.employee === employee;
      });
    });
  }, [timeSlots, reservedEvents, employee, formattedDate]);

  // Manejar cambio en el servicio seleccionado
  const handleTitleChange = async (e) => {
    const service = services.find(service => service.name === e.target.value);
    setSelectedService(service);
    setTitle(e.target.value);
    setEmployee('');
    setSelectedHour('');

    // Filtrar usuarios basados en el servicio seleccionado
    const filtered = users.filter(user => {
      const skills = user.skills?.[0]?.IdAdmin?.[username]?.skills;
      return skills && skills.includes(e.target.value); // Verifica si el servicio está en las habilidades del usuario
    });

    setFilteredUsers(filtered);
  };

  // Manejar cambio en el empleado seleccionado
  const handleEmployeeChange = (e) => {
    setEmployee(e.target.value);
    setSelectedHour('');
  };

  // Manejar cambio en la hora seleccionada
  const handleHourChange = (e) => {
    setSelectedHour(e.target.value);
  };

  // Guardar evento en la base de datos
  const store = async (e) => {
    e.preventDefault();

    if (!selectedHour || !initialStart) {
      alert("Debe seleccionar una fecha y una hora.");
      return;
    }

    const selectedDate = dayjs(initialStart).format('YYYY-MM-DD');
    const startDatetime = `${selectedDate} ${selectedHour}:00`;
    const endHour = dayjs(startDatetime).add(30, 'minute').format('YYYY-MM-DD HH:mm:ss');

    // Concatenar el username al title
    const eventTitle = `${title}/Client:${username3}`;

    try {
      const payload = {
        title: eventTitle,
        start: startDatetime,
        end: endHour,
        employee,
        payrollValue: selectedService && selectedService.payrollValue
          ? Number(selectedService.payrollValue)
          : 0,
        servicesValue: selectedService && selectedService.price
          ? Number(selectedService.price)
          : 0,
        done: Number(done)
      };

      console.log("📤 Enviando a backend:", payload);

      await axios.post(endpoint, payload);

      navigate(`/${username}/calendar`);
    } catch (error) {
      if (error.response) {
        // El backend respondió con un status de error (422, 500, etc.)
        console.error("❌ Error al guardar el evento:");
        console.error("Status:", error.response.status);
        console.error("Data:", error.response.data);
        console.error("Headers:", error.response.headers);

        alert(
          `Error ${error.response.status}: ${error.response.data.message || JSON.stringify(error.response.data)
          }`
        );
      } else if (error.request) {
        // La petición fue hecha pero no hubo respuesta
        console.error("⚠️ No hubo respuesta del servidor:", error.request);
        alert("No hubo respuesta del servidor. Verifica la conexión.");
      } else {
        // Algo pasó al configurar la petición
        console.error("⚡ Error al configurar la petición:", error.message);
        alert("Error al configurar la petición: " + error.message);
      }
    }

  };

  return (
    <div className='Container-calendarCreateEvent'>
      <Sidebar />
      <div className='Container-calendarCreateEvent2'>
        <br />
        <h3 style={{ color: '#090027' }}>Crear Cita en:</h3>
        <br />
        <LogoUser />
        <br />
        <h3 style={{ color: '#090027' }}>Fecha seleccionada:</h3>
        <h3 style={{ color: '#090027' }}>{formattedDate}</h3>
        <br />
        <form className='calendarCreateEvent' onSubmit={store}>
          <div className='neumorphic-sunken mb-4'>

            {/* Selección de Servicio */}
            <div className='mb-3'>
              <label className='form-label' style={{ color: '#090027' }}>Servicio</label>
              <select value={title} onChange={handleTitleChange} className='form-control'>
                <option value='' disabled>Seleccione un servicio</option>
                {services
                  .filter(service => service.name.includes(`/${username}`)) // Filtrar servicios por username
                  .map((service) => (
                    <option key={service.id} value={service.name}>
                      {service.name.split('/')[0]} {/* Aplicamos split('/')[0] aquí */}
                    </option>
                  ))}
              </select>
            </div>
          </div>

          {/* Selección de Empleado basado en Skill */}
          {title && (
            <div className='neumorphic-sunken mb-4'>
              <div className='mb-3'>
                <label className='form-label' style={{ color: '#090027' }}>Empleado</label>
                <select value={employee} onChange={handleEmployeeChange} className='form-control'>
                  <option value='' disabled>Seleccione un empleado</option>
                  {filteredUsers.map(user => (
                    <option key={user.id} value={user.name}>{user.name}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Selección de Horario */}
          {employee && (
            <div className='neumorphic-sunken mb-4'>
              <div className='mb-3'>
                <label className='form-label' style={{ color: '#090027' }}>Horario Disponible</label>
                <select value={selectedHour} onChange={handleHourChange} className='form-control'>
                  <option value='' disabled>Seleccione una hora</option>
                  {getAvailableHours.map(hour => (
                    <option key={hour} value={hour}>{hour}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Grupo de botones */}
          <div className='button-group'>
            <button
              type='submit'
              className='neumorphic-btn submit-btn'
              disabled={!selectedHour}
              onClick={(e) => {
                const confirmationMessage = `¿Estás seguro de que deseas agendar la cita?\n\nServicio: ${title.split('/')[0]}\nEmpleado: ${employee}\nHorario: ${selectedHour}`;
                if (!window.confirm(confirmationMessage)) {
                  e.preventDefault();
                }
              }}
            >
              Agendar Cita
            </button>

            <button
              type='button'
              className='neumorphic-btn cancel-btn'
              onClick={() => navigate(`/${username}/calendar`)}
            >
              Cancelar
            </button>
          </div>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default CreateEvent;