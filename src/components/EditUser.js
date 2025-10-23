import axios from "axios";
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from './Sidebar';
import Footer from './Footer';
import LogoUser from './LogoUser';
import './CSS/EditUser.css';
import { API_BASE_URL } from "./config";
import { FRONTEND_URL } from "./config";

const endpoint = `${API_BASE_URL}/users/`;
const servicesEndpoint = `${API_BASE_URL}/services`;

const EditUser = () => {
    const username = localStorage.getItem('idAdminKey');
    const [userData, setUserData] = useState({
        name: '',
        email: '',
        date_of_birth: '',
        phone: '',
        password: 'ClickCita',
        employee: true,
        skills: [
            {
                IdAdmin: {
                    [username]: {
                        rol: "Empleado",
                        skills: [], // Array de habilidades vacío por defecto
                        comprobanteDePago: "null",
                        planDePago: "null",
                    },
                },
            },
        ],
    });
    const [services, setServices] = useState([]); // Lista de servicios disponibles
    const [error, setError] = useState(null);
    const [emailError, setEmailError] = useState('');
    const navigate = useNavigate();
    const { id } = useParams();

    // Cargar los datos del usuario y los servicios disponibles
    useEffect(() => {
        const getUserById = async () => {
            try {
                const response = await axios.get(`${endpoint}${id}`);
                const data = response.data;

                // Completar el JSON con valores por defecto si falta algún dato
                const completedData = {
                    name: data.name || "Nombre de Usuario",
                    email: data.email || "usuario@example.com",
                    date_of_birth: data.date_of_birth || "2000-01-01",
                    phone: data.phone || "123456789",
                    password: data.password || "ClickCita",
                    employee: data.employee || true,
                    skills: data.skills || [
                        {
                            IdAdmin: {
                                [username]: {
                                    rol: "Empleado",
                                    skills: [], // Array de habilidades vacío por defecto
                                    comprobanteDePago: "null",
                                    planDePago: "null",
                                },
                            },
                        },
                    ],
                };

                setUserData(completedData);
            } catch (err) {
                console.error('Error fetching user data:', err);
                setError({ general: 'Error al cargar los datos del usuario.' });
            }
        };

        const getServices = async () => {
            try {
                const response = await axios.get(servicesEndpoint);
                setServices(response.data);
            } catch (err) {
                console.error('Error fetching services:', err);
                setError({ general: 'Error al cargar los servicios.' });
            }
        };

        getUserById();
        getServices();
    }, [id]);

    // Manejar cambios en los checkboxes de servicios
    const handleServiceChange = (e) => {
        const serviceName = e.target.value;
        const updatedSkills = userData.skills[0].IdAdmin[username].skills.includes(serviceName)
            ? userData.skills[0].IdAdmin[username].skills.filter((name) => name !== serviceName) // Eliminar si ya está seleccionado
            : [...userData.skills[0].IdAdmin[username].skills, serviceName]; // Agregar si no está seleccionado

        // Actualizar el estado de userData con las nuevas skills
        setUserData({
            ...userData,
            skills: [
                {
                    IdAdmin: {
                        [username]: {
                            ...userData.skills[0].IdAdmin[username],
                            skills: updatedSkills, // Actualizar el array de skills
                        },
                    },
                },
            ],
        });
    };

    // Validar el correo electrónico
    const validateEmail = (value) => {
        if (!/^[a-zA-Z0-9._%+-]+@gmail\.com$/.test(value)) {
            setEmailError('Ingresa una cuenta @gmail.com');
        } else {
            setEmailError('');
        }
    };

    // Enviar los datos actualizados al backend
    const update = async (e) => {
        e.preventDefault();

        // Validar el correo antes de enviar el formulario
        if (emailError) {
            setError({ general: 'Por favor, corrige el correo electrónico.' });
            return;
        }

        try {
            // Datos que se enviarán al backend
            const updatedData = {
                name: userData.name,
                email: userData.email,
                date_of_birth: userData.date_of_birth,
                phone: userData.phone,
                password: userData.password,
                employee: userData.employee,
                skills: userData.skills, // Enviar el JSON completo de skills
            };



            const response = await axios.put(`${endpoint}${id}`, updatedData);


            // Redirigir a la página de usuarios después de la actualización
            navigate(`/${username}/users`);
        } catch (err) {
            console.error("Error al actualizar el usuario:", err);
            if (err.response) {
                console.error("Detalles del error:", err.response.data); // Inspeccionar el mensaje de error
                setError(err.response.data.errors || { general: 'Error en el servidor.' });
            } else {
                setError({ general: 'Error inesperado al actualizar el usuario.' });
            }
        }
    };

    return (
        <div className='Container-calendarEditUser'>
            <Sidebar />
            <div className='Container-calendarEditUser2'>
                <br></br>
                <h3 style={{ color: '#090027' }}>Editar Empleado</h3>
                <LogoUser />
                <br></br>
                {error && (
                    <div className="alert alert-danger">
                        {Object.keys(error).map((key) => (
                            <div key={key}>{error[key]}</div>
                        ))}
                    </div>
                )}
                <form className="calendarEditUser" onSubmit={update}>
                    {/* Campos del formulario */}
                    <div className='mb-3'>
                        <label className='form-label' style={{ color: '#090027' }}>Nombre</label>
                        <input
                            value={userData.name}
                            onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                            type='text'
                            className='form-control'
                            required
                        />
                    </div>
                    <div className='mb-3'>
                        <label className='form-label' style={{ color: '#090027' }}>Correo@</label>
                        <input
                            value={userData.email}
                            onChange={(e) => {
                                const value = e.target.value;
                                setUserData({ ...userData, email: value });
                                validateEmail(value); // Validar el correo en tiempo real
                            }}
                            type='email'
                            className='form-control'
                            required
                        />
                        {emailError && <div style={{ color: 'red', marginTop: '5px' }}>{emailError}</div>}
                    </div>
                    <div className='mb-3'>
                        <label className='form-label' style={{ color: '#090027' }}>Cumpleaños</label>
                        <input
                            value={userData.date_of_birth}
                            onChange={(e) => setUserData({ ...userData, date_of_birth: e.target.value })}
                            type='date'
                            className='form-control'
                            required
                        />
                    </div>
                    <div className='mb-3'>
                        <label className='form-label' style={{ color: '#090027' }}>Tel.</label>
                        <input
                            value={userData.phone}
                            onChange={(e) => setUserData({ ...userData, phone: e.target.value })}
                            type='text'
                            className='form-control'
                            required
                        />
                    </div>
                    <div className='mb-3' style={{ display: 'none' }}>
                        <label className='form-label'>Password</label>
                        <input
                            value={userData.password}
                            type='password'
                            className='form-control'
                            required
                            readOnly
                        />
                    </div>
                    <div className='mb-3' style={{ display: 'none' }}>
                        <label className='form-label' style={{ color: '#090027' }}>Employee</label>
                        <input
                            checked={userData.employee}
                            type='checkbox'
                            className='form-check-input'
                            style={{ backgroundColor: userData.employee ? '#090027' : '', borderColor: userData.employee ? '#090027' : '' }}
                            readOnly
                        />
                    </div>

                    <div className="mb-3">
                        <h6 className="text-dark">Agregar o Borrar skills:</h6>
                        <div className="row">
                            {services
                                .filter(service => service.name.includes(`/${username}`))
                                .map((service) => (
                                    <div key={service.id} className="col-md-6 d-flex align-items-center mb-2">
                                        <div className="form-check form-switch-custom me-2">
                                            <label className="switch">
                                                <input
                                                    type="checkbox"
                                                    checked={userData.skills[0]?.IdAdmin?.[username]?.skills?.includes(service.name)}
                                                    onChange={handleServiceChange}
                                                    value={service.name}
                                                />
                                                <span className="slider round"></span>
                                            </label>
                                        </div>
                                        <span className="switch-label">{service.name.split('/')[0]}</span>
                                    </div>
                                ))}
                        </div>
                    </div>

                    <button type='submit' className="neumorphic-btn submit-btn"
                        onClick={(e) => {
                            const confirmationMessage = `¿Estás seguro de editar este Empleado?`;

                            if (!window.confirm(confirmationMessage)) {
                                e.preventDefault(); // Evita el envío si el usuario cancela
                            }
                        }}>Editar</button><br></br>
                    <button
                        type="button"
                        className="neumorphic-btn cancel-btn"
                        onClick={() => navigate(`/${username}/calendar`)}
                    >
                        Cancelar
                    </button><br></br>
                </form>
            </div>
            <Footer />
        </div>
    );
};

export default EditUser;