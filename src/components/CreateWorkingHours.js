import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';
import Footer from './Footer';
import LogoUser from './LogoUser';
import './CSS/CreateWorkingHours.css';
import { API_BASE_URL } from "./config";
import { FRONTEND_URL } from "./config";

const usersEndpoint = `${API_BASE_URL}/users`;

const CreateWorkingHours = () => {
    const navigate = useNavigate();
    const [steps, setSteps] = useState([
        { id: 1, active: true },
        { id: 2, active: false },
        { id: 3, active: false },
    ]);

    const [schedule, setSchedule] = useState({
        lunes: { horaInicioJornada: "08:00", horaFinJornada: "20:00", horaInicioAlmuerzo: "13:00", horaFinAlmuerzo: "14:00" },
        martes: { horaInicioJornada: "08:00", horaFinJornada: "20:00", horaInicioAlmuerzo: "13:00", horaFinAlmuerzo: "14:00" },
        miércoles: { horaInicioJornada: "08:00", horaFinJornada: "20:00", horaInicioAlmuerzo: "13:00", horaFinAlmuerzo: "14:00" },
        jueves: { horaInicioJornada: "08:00", horaFinJornada: "20:00", horaInicioAlmuerzo: "13:00", horaFinAlmuerzo: "14:00" },
        viernes: { horaInicioJornada: "08:00", horaFinJornada: "20:00", horaInicioAlmuerzo: "13:00", horaFinAlmuerzo: "14:00" },
        sábado: { horaInicioJornada: "08:00", horaFinJornada: "20:00", horaInicioAlmuerzo: "13:00", horaFinAlmuerzo: "14:00" },
        domingo: { horaInicioJornada: "08:00", horaFinJornada: "20:00", horaInicioAlmuerzo: "13:00", horaFinAlmuerzo: "14:00" },
    });

    const accessToken = localStorage.getItem("accessToken");
    const user = JSON.parse(localStorage.getItem("user"));

    // Obtener todos los datos del usuario al cargar el componente
    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await fetch(`${usersEndpoint}/${user.id}`, {
                    headers: { Authorization: `Bearer ${accessToken}` }
                });
                const data = await response.json();

                // Verificar si skills existe en los datos obtenidos
                if (data.skills) {
                    setSchedule(data.skills);
                }

                localStorage.setItem("userData", JSON.stringify(data));
            } catch (error) {
                console.error("Error fetching user data:", error);
            }
        };

        if (!localStorage.getItem("userData")) {
            fetchUserData();
        } else {
            const userData = JSON.parse(localStorage.getItem("userData"));
            if (userData.skills) {
                setSchedule(userData.skills);
            }
        }
    }, [user.id, accessToken]);

    const handleNext = (id) => {
        setSteps(prevSteps => {
            const newSteps = [...prevSteps];
            const index = newSteps.findIndex(step => step.id === id);
            if (index < newSteps.length - 1) {
                newSteps[index].active = false;
                newSteps[index + 1].active = true;
            }
            return newSteps;
        });
    };

    const handleScheduleChange = (field, value) => {
        setSchedule(prevSchedule => {
            const updatedSchedule = { ...prevSchedule };
            Object.keys(updatedSchedule).forEach(day => {
                updatedSchedule[day] = { ...updatedSchedule[day], [field]: value };
            });
            localStorage.setItem("skills", JSON.stringify(updatedSchedule));
            return updatedSchedule;
        });
    };

    const handleScheduleChangeForDay = (day, field, value) => {
        setSchedule(prevSchedule => {
            const updatedSchedule = {
                ...prevSchedule,
                [day]: {
                    ...prevSchedule[day],
                    [field]: value
                }
            };
            localStorage.setItem("skills", JSON.stringify(updatedSchedule));
            return updatedSchedule;
        });
    };

    const formatSchedule = () => {
        return ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"].map((day, index) => {
            const times = schedule[day] || {};
            return `${index}: ${times.horaInicioJornada || "00:00"}-${times.horaFinJornada || "00:00"} (Almuerzo: ${times.horaInicioAlmuerzo || "00:00"}-${times.horaFinAlmuerzo || "00:00"})`;
        });
    };

    const saveSchedule = async (e) => {
        e.preventDefault();

        const userData = JSON.parse(localStorage.getItem("userData"));
        if (!userData.date_of_birth || !userData.employee || !userData.phone) {
            alert("Faltan datos obligatorios en el perfil del usuario. Por favor, complete su perfil antes de continuar.");
            navigate('/edit-profile');
            return;
        }

        const updatedSchedule = formatSchedule();

        try {
            await axios.put(`${usersEndpoint}/${user.id}`, {
                ...userData,
                skills: updatedSchedule,
            }, {
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                }
            });

            alert("Horario actualizado correctamente");
            navigate('/users');
        } catch (err) {
            console.error("Error al actualizar el horario:", err.response?.data || err);
            alert("Hubo un error al actualizar el horario");
        }
    };

    return (
        <div className="container">
            <Sidebar />
            <LogoUser />
            <div className="main-content">
                {steps.map(step => (
                    <div key={step.id} className={`step step-${step.id} ${step.active ? '' : 'disabled'}`}>
                        {step.id === 1 ? (
                            <>
                                <p>Seleccione primero el horario de atención</p>
                                <div className="time-inputs">
                                    <label>Inicio jornada:</label>
                                    <input
                                        type="time"
                                        min="00:00"
                                        max="23:59"
                                        step="60"
                                        value={schedule.lunes.horaInicioJornada} // Usar el valor del estado
                                        onChange={(e) => handleScheduleChange("horaInicioJornada", e.target.value)}
                                    />
                                    <label>Fin jornada:</label>
                                    <input
                                        type="time"
                                        min="00:00"
                                        max="23:59"
                                        step="60"
                                        value={schedule.lunes.horaFinJornada} // Usar el valor del estado
                                        onChange={(e) => handleScheduleChange("horaFinJornada", e.target.value)}
                                    />
                                </div>
                                <button onClick={() => handleNext(step.id)}>Siguiente</button>
                            </>
                        ) : step.id === 2 ? (
                            <>
                                <p>Seleccionar horario de almuerzo</p>
                                <div className="time-inputs">
                                    <label>Inicio almuerzo:</label>
                                    <input
                                        type="time"
                                        min="00:00"
                                        max="23:59"
                                        step="60"
                                        value={schedule.lunes.horaInicioAlmuerzo} // Usar el valor del estado
                                        onChange={(e) => handleScheduleChange("horaInicioAlmuerzo", e.target.value)}
                                    />
                                    <label>Fin almuerzo:</label>
                                    <input
                                        type="time"
                                        min="00:00"
                                        max="23:59"
                                        step="60"
                                        value={schedule.lunes.horaFinAlmuerzo} // Usar el valor del estado
                                        onChange={(e) => handleScheduleChange("horaFinAlmuerzo", e.target.value)}
                                    />
                                </div>
                                <button onClick={() => handleNext(step.id)}>Siguiente</button>
                            </>
                        ) : step.id === 3 ? (
                            <>
                                <p>Revisar y Editar</p>
                                <div className="review-section">
                                    {["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"].map(day => (
                                        <div key={day}>
                                            <h3>{day}</h3>
                                            <div className="time-settings">
                                                <div className="time-inputs">
                                                    <label>Inicio jornada:</label>
                                                    <input
                                                        type="time"
                                                        min="00:00"
                                                        max="23:59"
                                                        step="60"
                                                        value={schedule[day].horaInicioJornada} // Usar el valor del estado
                                                        onChange={(e) => handleScheduleChangeForDay(day, "horaInicioJornada", e.target.value)}
                                                    />
                                                    <label>Fin jornada:</label>
                                                    <input
                                                        type="time"
                                                        min="00:00"
                                                        max="23:59"
                                                        step="60"
                                                        value={schedule[day].horaFinJornada} // Usar el valor del estado
                                                        onChange={(e) => handleScheduleChangeForDay(day, "horaFinJornada", e.target.value)}
                                                    />
                                                </div>
                                                <div className="time-inputs">
                                                    <label>Inicio almuerzo:</label>
                                                    <input
                                                        type="time"
                                                        min="00:00"
                                                        max="23:59"
                                                        step="60"
                                                        value={schedule[day].horaInicioAlmuerzo} // Usar el valor del estado
                                                        onChange={(e) => handleScheduleChangeForDay(day, "horaInicioAlmuerzo", e.target.value)}
                                                    />
                                                    <label>Fin almuerzo:</label>
                                                    <input
                                                        type="time"
                                                        min="00:00"
                                                        max="23:59"
                                                        step="60"
                                                        value={schedule[day].horaFinAlmuerzo} // Usar el valor del estado
                                                        onChange={(e) => handleScheduleChangeForDay(day, "horaFinAlmuerzo", e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <button onClick={saveSchedule}>Guardar Cambios</button>
                                </div>
                            </>
                        ) : ''}
                    </div>
                ))}
            </div>
            <Footer />
        </div>
    );
};

export default CreateWorkingHours;