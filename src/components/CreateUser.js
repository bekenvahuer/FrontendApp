import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Footer from './Footer';
import LogoUser from './LogoUser';
import './CSS/CreateUsers.css'; // Asegúrate de importar el archivo CSS
import { API_BASE_URL } from "./config";
import { FRONTEND_URL } from "./config";

const endpoint = `${API_BASE_URL}/users`;
const servicesEndpoint = `${API_BASE_URL}/services`; // Endpoint para obtener los servicios

const CreateUser = () => {
    const username = localStorage.getItem('idAdminKey');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [date_of_birth, setDateOfBirth] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('ClickCita'); // Estado para la contraseña
    const [employee, setEmployee] = useState(true); // Estado para el checkbox de empleado
    const [skills, setSkills] = useState([
        {
            IdAdmin: {
                [username]: {
                    rol: "Emp",
                    skills: [], // Array de habilidades vacío por defecto
                    comprobanteDePago: "null",
                    planDePago: "null",
                },
            },
        },
    ]); // Estado para las skills en formato JSON
    const [services, setServices] = useState([]); // Estado para almacenar los servicios
    const [error, setError] = useState(null); // Estado para el manejo de errores
    const [emailError, setEmailError] = useState(''); // Estado para el error del correo
    const navigate = useNavigate();


    // Obtener los servicios cuando el componente se monta
    useEffect(() => {
        const getServices = async () => {
            try {
                const response = await axios.get(servicesEndpoint);
                setServices(response.data);
            } catch (err) {
                console.error('Error fetching services:', err);
            }
        };

        getServices();
    }, []);

    // Manejar la selección de servicios
    const handleServiceChange = (e) => {
        const serviceName = e.target.value;
        const updatedSkills = skills[0].IdAdmin[username].skills.includes(serviceName)
            ? skills[0].IdAdmin[username].skills.filter((name) => name !== serviceName) // Eliminar si ya está seleccionado
            : [...skills[0].IdAdmin[username].skills, serviceName]; // Agregar si no está seleccionado

        // Actualizar el estado de skills
        setSkills([
            {
                IdAdmin: {
                    [username]: {
                        ...skills[0].IdAdmin[username],
                        skills: updatedSkills, // Actualizar el array de skills
                    },
                },
            },
        ]);
    };

    // Validar el correo electrónico
    const validateEmail = (value) => {
        if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(value)) {
            setEmailError('Ingresa una cuenta @gmail.com');
        } else {
            setEmailError('');
        }
    };

    const store = async (e) => {
        e.preventDefault();

        // Validar el correo antes de enviar el formulario
        if (emailError) {
            setError({ general: 'Por favor, corrige el correo electrónico.' });
            return;
        }

        try {
            // Datos que se enviarán al backend
            const userData = {
                name,
                email,
                date_of_birth,
                phone,
                password,
                employee,
                skills, // Enviar el JSON completo de skills
            };



            const response = await axios.post(endpoint, userData);


            // Redirigir a la página de usuarios después de la creación
            navigate(`/${username}/users`);
        } catch (err) {
            if (err.response) {
                setError(err.response.data.errors); // Guardar los mensajes de error del servidor
            } else {
                setError({ general: 'Error inesperado al crear el usuario.' }); // Mensaje de error genérico
            }
        }
    };

    return (
        <div className='Container-calendarCreateUser'>
            <Sidebar />
            <div className='Container-calendarCreateUser2'>
                <br></br>
                <h3 style={{ color: '#090027' }}>Crear Empleado</h3>
                <br></br>
                <LogoUser />
                <br></br>
                {error && (
                    <div className="alert alert-danger">
                        {Object.keys(error).map((key) => (
                            <div key={key}>{error[key]}</div>
                        ))}
                    </div>
                )}
                <form className='calendarCreateEvent' onSubmit={store}>
                    <div className='mb-3'>
                        <label className='form-label' style={{ color: '#090027' }}>Nombre</label>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            type='text'
                            className='form-control'
                            required
                        />
                    </div>
                    <div className='mb-3'>
                        <label className='form-label' style={{ color: '#090027' }}>Correo@</label>
                        <input
                            value={email}
                            onChange={(e) => {
                                const value = e.target.value;
                                setEmail(value);
                                validateEmail(value); // Validar el correo en tiempo real
                            }}
                            type='email'
                            className='form-control'
                            placeholder="Ingresa una cuenta @gmail.com"
                            required
                        />
                        {emailError && <div style={{ color: 'red', marginTop: '5px' }}>{emailError}</div>}
                    </div>
                    <div className='mb-3'>
                        <label className='form-label' style={{ color: '#090027' }}>Cumpleaños</label>
                        <input
                            value={date_of_birth}
                            onChange={(e) => setDateOfBirth(e.target.value)}
                            type='date'
                            className='form-control'
                            required
                        />
                    </div>
                    <div className='mb-3'>
                        <label className='form-label' style={{ color: '#090027' }}>Tel.</label>
                        <input
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            type='text'
                            className='form-control'
                            required
                        />
                    </div>
                    <div className='mb-3' style={{ display: 'none' }}>
                        <label className='form-label'>Password</label>
                        <input
                            value={password}
                            type='password'
                            className='form-control'
                            required
                            readOnly
                        />
                    </div>
                    <div className='mb-3' style={{ display: 'none' }}>
                        <label className='form-label' style={{ color: '#090027' }}>Employee</label>
                        <input
                            checked={employee}
                            type='checkbox'
                            className='form-check-input'
                            style={{ backgroundColor: employee ? '#090027' : '', borderColor: employee ? '#090027' : '' }}
                            readOnly
                        />
                    </div>

                    {/* Bloque para los servicios (skills) */}
                    <div className='mb-3'>
                        <label className='form-label' style={{ color: '#090027' }}>Skills (Servicios que puede realizar)</label>
                        {services
                            .filter(service => service.name.includes(`/${username}`)) // Filtrar servicios por username
                            .map((service) => (
                                <div key={service.id} className="col-md-6 d-flex align-items-center mb-2">
                                    <div className="form-check form-switch-custom me-2">
                                        <label className="switch">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                value={service.name}
                                                checked={skills[0]?.IdAdmin?.[username]?.skills?.includes(service.name)} // Marcar si la habilidad está seleccionada
                                                onChange={handleServiceChange}
                                            />
                                            <span className="slider round"></span>
                                        </label>
                                    </div>
                                    <label className="switch-label">
                                        {service.name.split('/')[0]} {/* Mostrar solo la parte relevante del nombre */}
                                    </label>
                                </div>
                            ))}
                    </div>

                    <button type='submit' className="neumorphic-btn submit-btn"
                        onClick={(e) => {
                            const confirmationMessage = `¿Estás seguro de crear este Empleado?`;

                            if (!window.confirm(confirmationMessage)) {
                                e.preventDefault(); // Solo evita el envío si el usuario cancela
                            }
                        }}>Crear</button><br></br>
                    <button
                        type="button"
                        className="neumorphic-btn cancel-btn"
                        style={{ backgroundColor: "#4e54e7", color: "#eddeff" }}
                        onClick={() => navigate(`/${username}/calendar`)}
                    >
                        Cancelar
                    </button>
                </form>
            </div>
            <Footer />
        </div>
    );
};

export default CreateUser;