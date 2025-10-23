import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, dayjsLocalizer, Views } from 'react-big-calendar';
import "react-big-calendar/lib/css/react-big-calendar.css";
import { FaDollarSign, FaEdit, FaTrash, FaCalendarCheck, FaRegCopy } from 'react-icons/fa';
import dayjs from "dayjs";
import "dayjs/locale/es"; // Importar idioma español
import axios from 'axios';
import Modal from 'react-modal';
import './CSS/CalendarPage.css';
import SidebarUser from './SidebarUser';
import Carrucel from './Carrucel';
import Footer from './Footer';
import imagenQr from './qr13.webp';
import imgPhone from './phone.png';
import imgHappyB from './HappyBirthDay.png';
import ClickCita from './ClickCita.png';
import ClickCita2 from './ClickCita2.png';
import { updateUserProfile } from "./Api";
import { QRCodeSVG } from 'qrcode.react'; // Usar QRCodeSVG
import { API_BASE_URL } from "./config";
import { FRONTEND_URL } from "./config";


dayjs.locale("es"); // Establecer español como idioma predeterminado
const localizer = dayjsLocalizer(dayjs);
const username = localStorage.getItem('idAdminKey');
const username2 = localStorage.getItem("user");
const userObject = username2 ? JSON.parse(username2) : {}; // Evita que sea null
const username3 = userObject.name || "Usuario"; // Si no tiene nombre, usar "Usuario"


const CalendarPageUser = () => {
    const [isCopied, setIsCopied] = useState(false);
    const [userName, setUserName] = useState("Usuario");
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [phone, setPhone] = useState("");
    const [birthday, setBirthday] = useState("");
    const [error, setError] = useState(null); // Declara error y setError aquí
    const [events, setEvents] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [showQR, setShowQR] = useState(false); // Estado para mostrar u ocultar el QR
    const [isActionModalOpen, setIsActionModalOpen] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const [calendarView, setCalendarView] = useState('month');
    const [selectedDate, setSelectedDate] = useState(new Date());
    const navigate = useNavigate();
    // Estado para almacenar los datos del negocio
    const [businessData, setBusinessData] = useState({
        planDePago: 'Free', // Valor por defecto
        nombreNegocio: '',
        direccionNegocio: '',
        whatsapp: ''
    });

    const handleCopyUrl = () => {
        const url = `${FRONTEND_URL}/${username}`;
        navigator.clipboard.writeText(url)
            .then(() => {
                setIsCopied(true);
                setTimeout(() => setIsCopied(false), 2000); // Oculta el mensaje después de 2 segundos
            })
            .catch(err => console.error('Error al copiar:', err));
    };


    const messages = {
        today: "Hoy",
        previous: "Anterior",
        next: "Siguiente",
        month: "Mes",
        week: "Semana",
        day: "Día",
        agenda: "Agenda",
        date: "Fecha",
        time: "Hora",
        event: "Evento",
        noEventsInRange: "No hay eventos en este rango",
        showMore: (total) => `+ Ver más (${total})`,
    };

    useEffect(() => {
        // Obtener los datos del usuario desde localStorage
        const userData = localStorage.getItem("user");
        const needsProfileUpdate = localStorage.getItem("needsProfileUpdate") === "true";

        if (userData) {
            try {
                const user = JSON.parse(userData);
                setUserName(user?.name || "Usuario"); // Si no tiene nombre, mostrar "Usuario"

                // Verificar si el usuario tiene datos de perfil
                const hasProfileData = user?.phone && user?.date_of_birth;
                if (!hasProfileData || needsProfileUpdate) {
                    setIsProfileModalOpen(true);
                }
            } catch (error) {
                console.error("Error parsing user data:", error);
            }
        }

        axios.get(`${API_BASE_URL}/events`)
            .then(response => {
                const filteredEvents = response.data.filter(event =>
                    event.title.includes(`/${username}/Client:${username3}`)
                );

                const formattedEvents = filteredEvents.map(event => ({
                    start: new Date(event.start),
                    end: new Date(event.end),
                    id: event.id,
                    title: event.title,
                    employee: event.employee,
                    color: event.done ? '#99d2ef' : '#5c7acb',
                    hideButton: event.done
                }));

                setEvents(formattedEvents);
            })
            .catch(error => {
                console.error('Error fetching events:', error);
            });
    }, []);


    useEffect(() => {
        const fetchBusinessData = async () => {
            try {
                const idAdminKey = localStorage.getItem('idAdminKey');
                // Codifica el idAdminKey para manejar caracteres especiales
                const encodedKey = encodeURIComponent(idAdminKey);
                const response = await axios.get(
                    `${API_BASE_URL}/business/${encodedKey}`, // Usa encodedKey
                    {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
                        }
                    }
                );

                if (response.data.success) {
                    setBusinessData(response.data.data);
                }
            } catch (error) {
                console.error('Detalle del error:', {
                    idAdminKey: localStorage.getItem('idAdminKey'),
                    error: error.response?.data || error.message
                });
            }
        };

        fetchBusinessData();
    }, []);

    // Agrupar eventos solo en la vista "month"
    const groupedEvents = useMemo(() => {
        if (calendarView !== 'month') {
            return events; // Retornar eventos individuales en otras vistas
        }

        // Crear un mapa para agrupar eventos por fecha
        const eventMap = new Map();
        events.forEach(event => {
            const date = dayjs(event.start).format('YYYY-MM-DD'); // Agrupar por día
            if (!eventMap.has(date)) {
                eventMap.set(date, { count: 0 });
            }
            eventMap.get(date).count++;
        });

        // Convertir el mapa en un array de eventos agrupados
        return Array.from(eventMap.entries()).map(([date, data]) => ({
            start: dayjs(date).toDate(),
            end: dayjs(date).toDate(),
            title: (
                <div style={{ position: "relative", display: "inline-block", zIndex: 1 }}>
                    <FaCalendarCheck style={{ height: "1.5em", width: "1.5em", zIndex: 1 }} />
                    {data.count >= 2 && ( // Solo mostrar si hay 2 o más eventos
                        <span
                            style={{
                                position: "absolute",
                                top: "-8px",
                                right: "-8px",
                                backgroundColor: "#ef99dc",
                                color: "white",
                                borderRadius: "50%",
                                width: "24px",
                                height: "24px",
                                fontSize: "12px",
                                fontWeight: "bold",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                zIndex: 9999,
                                boxShadow: "0px 0px 6px rgba(0, 0, 0, 0.4)",
                                pointerEvents: "none",
                            }}
                        >
                            {data.count}
                        </span>
                    )}
                </div>
            ),
        }));
    }, [events, calendarView]);

    const handleSelectSlot = (slotInfo) => {
        const today = dayjs().startOf('day');
        const selectedDate = dayjs(slotInfo.start).startOf('day');

        if (selectedDate.isBefore(today)) {
            alert("No puedes seleccionar días anteriores a hoy.");
            return;
        }

        setSelectedSlot(slotInfo);

        // Verificar si el slot tiene eventos
        const hasEvents = events.some(event =>
            dayjs(event.start).isSame(selectedDate, 'day')
        );

        if (hasEvents) {
            setIsActionModalOpen(true);
        } else {
            navigate(`/${username}/events/createUser`, { state: { start: slotInfo.start, end: slotInfo.end } });
        }
    };

    const handleEventClick = (event) => {
        if (!event) {
            console.error("No se ha seleccionado ningún evento.");
            return;
        }

        if (event.start && typeof event.start === 'string') {
            event.start = new Date(event.start);
        }

        // Guardar el evento seleccionado
        setSelectedEvent(event);

        // Abrir el modal unificado
        setIsActionModalOpen(true);
    };

    const handleViewChange = (newView) => {
        // Bloquear el cambio automático a la vista 'day'
        if (newView === 'day' && calendarView !== 'day') {
            return; // No permitir el cambio de vista
        }
        setCalendarView(newView); // Permitir otros cambios de vista
    };

    const closeModal = () => {
        setIsActionModalOpen(false);
        setSelectedEvent(null);
    };

    const toggleQRView = () => {
        setShowQR(!showQR);
    };

    // Componente GeneratorQr definido dentro de CalendarPage
    const GeneratorQr = () => {
        const username = localStorage.getItem('idAdminKey');
        const url = `${FRONTEND_URL}/${username}`;

        return (
            <div className="qr-code-container">
                <QRCodeSVG
                    value={url}
                    size={180}
                    level="H"
                    includeMargin={true}
                />
            </div>
        );
    };

    const CustomToolbar = (toolbar) => {
        return (
            <div className="rbc-toolbar">
                <span className="rbc-btn-group">
                    <button onClick={() => toolbar.onNavigate('PREV')}>Anterior</button>
                    <button onClick={() => toolbar.onNavigate('TODAY')}>Hoy</button>
                    <button onClick={() => toolbar.onNavigate('NEXT')}>Siguiente</button>
                </span>
                <span className="rbc-toolbar-label">{toolbar.label}</span>
            </div>
        );
    };

    const deleteEvent = async (id) => {
        try {
            await axios.delete(`${API_BASE_URL}/events/${id}`);
            setEvents(events.filter(event => event.id !== id));
            setSelectedEvent(null); // Close modal after deletion
        } catch (error) {
            console.error('Error deleting event:', error);
        }
    };

    const updateEventAndCreateSale = async (id) => {
        try {
            await axios.post(`${API_BASE_URL}/update-event-and-create-sale/${id}`);
            const updatedEvents = events.map(event =>
                event.id === id ? { ...event, color: '#e296b5', hideButton: true } : event
            );
            setEvents(updatedEvents);
            setSelectedEvent(updatedEvents.find(event => event.id === id));
        } catch (error) {
            console.error('Error updating event:', error);
        }
    };

    const handleSaveProfile = async () => {
        setError(null); // Limpiar errores anteriores
        if (!phone || !birthday) {
            alert("Por favor, completa todos los campos obligatorios.");
            return;
        }

        // Validar que el teléfono tenga 10 dígitos
        if (phone.length !== 10) {
            alert("El teléfono debe tener 10 dígitos.");
            return;
        }

        // Validar que la fecha no sea futura
        const selectedDate = new Date(birthday);
        const today = new Date();
        if (selectedDate > today) {
            alert("La fecha de cumpleaños no puede ser futura.");
            return;
        }

        const userData = JSON.parse(localStorage.getItem("user")) || {};
        userData.phone = phone;
        userData.date_of_birth = birthday; // Asegurar que el campo coincide con la BD

        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.removeItem("needsProfileUpdate");

        try {
            await updateUserProfile(userData); // Subir los datos al backend
            setIsProfileModalOpen(false); // Cerrar el modal después de guardar
        } catch (error) {
            setError("Error al actualizar el perfil. Inténtalo de nuevo.");
            console.error("Error al actualizar el perfil:", error.message);
        }
    };

    const firstName = userName.match(/^[A-Za-zÁÉÍÓÚáéíóúÑñ]+/)?.[0] || "";
    const formattedName = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();

    return (
        <div className='Container-calendar'>
            <SidebarUser toggleQRView={toggleQRView} setCalendarView={setCalendarView} />
            <Carrucel />
            <div className='Title-calendar-cont'>
                <h1 className='Title-calendar'>Agenda tu cita {formattedName}!</h1>
            </div>
            <div>
                {/* Nuevo Modal para teléfono y cumpleaños */}
                <Modal
                    isOpen={isProfileModalOpen}
                    onRequestClose={() => setIsProfileModalOpen(false)}
                    contentLabel="Completa tu perfil"
                    overlayClassName="ReactModal__Overlay"
                    className="ReactModal__Content"
                    ariaHideApp={false}
                    shouldCloseOnOverlayClick={false} // Evita que el modal se cierre al hacer clic fuera
                >
                    <div className="modal-header">
                        <h3>Completa tu perfil</h3>
                        <img src={ClickCita2} alt="ClickCita Logo" style={{ width: '120px', height: 'auto', cursor: 'pointer' }} />
                    </div>
                    <div className="modal-body" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                        {error && <p className="error-message">{error}</p>}
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px" }}>
                            <img src={imgPhone} alt="Imagen Phone" width="50" height="60" />
                            <input
                                type="text"
                                value={phone}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    if (/^\d{0,10}$/.test(value)) {
                                        setPhone(value);
                                        setError(null);
                                    } else {
                                        setError("El teléfono solo debe contener números y tener 10 dígitos.");
                                    }
                                }}
                                placeholder="Ingresa tu teléfono"
                                required
                            />
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "5px" }}>
                            <img src={imgHappyB} alt="Imagen HappyB" width="50" height="70" />
                            <input
                                type="date"
                                value={birthday}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    const selectedDate = new Date(value);
                                    const today = new Date();
                                    if (selectedDate <= today) {
                                        setBirthday(value);
                                        setError(null);
                                    } else {
                                        setError("La fecha de cumpleaños no puede ser futura.");
                                    }
                                }}
                                required
                            />
                            <p class="advert">*Tu fecha de nacimiento no se mostrará públicamente.</p>
                        </div>
                    </div>
                    <div className="modal-buttons-cumple">
                        <button onClick={handleSaveProfile} style={{ background: "#99d2ef", color: "#090027", padding: "10px 20px", border: "none", borderRadius: "5px", marginTop: "10px", cursor: "pointer" }}>Guardar</button>
                    </div>
                </Modal>

                {/* Modal unificado */}
                <Modal
                    isOpen={isActionModalOpen}
                    onRequestClose={closeModal}
                    contentLabel="Detalles de la cita"
                    overlayClassName="ReactModal__Overlay"
                    className="ReactModal__Content"
                    ariaHideApp={false}
                >
                    <div className="modal-header-calendarPage">
                        <h3>{calendarView === 'month' ? 'Selecciona una acción' : 'Detalles de la cita'}</h3>
                    </div>
                    <div className="modal-body">
                        {calendarView === 'month' ? (
                            // Contenido para la vista 'month'
                            <>
                                <p>¿Qué deseas hacer con el día seleccionado?</p>
                                <div className="modal-buttons">
                                    <button
                                        onClick={() => {
                                            if (!selectedSlot) {
                                                alert("No se ha seleccionado ningún slot.");
                                                return;
                                            }
                                            setIsActionModalOpen(false);
                                            navigate(`/${username}/events/createUser`, { state: { start: selectedSlot.start, end: selectedSlot.end } });
                                        }}
                                        style={{ background: "#6e8cc2", color: "#090027", padding: "10px 20px", border: "none", borderRadius: "5px", marginRight: "10px", cursor: "pointer" }}
                                    >
                                        Agendar
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (!selectedSlot) {
                                                alert("No se ha seleccionado ningún slot.");
                                                return;
                                            }
                                            setIsActionModalOpen(false);
                                            setCalendarView('day');
                                            setSelectedDate(new Date(selectedSlot.start));
                                        }}
                                        style={{ background: "#99d2ef", color: "#090027", padding: "10px 20px", border: "none", borderRadius: "5px", cursor: "pointer" }}
                                    >
                                        Ver
                                    </button>
                                </div>
                            </>
                        ) : (
                            // Contenido para la vista 'day'
                            <>
                                {selectedEvent ? (
                                    <>
                                        <p><strong>Servicio:</strong> {selectedEvent.title.split('/')[0]}</p>
                                        <p><strong>Cliente:</strong> {username3}</p>
                                        <p><strong>Empleado:</strong> {selectedEvent.employee}</p>
                                        <p><strong>De:</strong> {dayjs(selectedEvent.start).format('MMMM D, YYYY h:mm A')}</p>
                                        <p><strong>Hasta:</strong> {dayjs(selectedEvent.end).format('MMMM D, YYYY h:mm A')}</p>
                                        {/* <div className="modal-buttons">
                                            <Link
                                                to={`/events/edit/${selectedEvent.id}`}
                                                className="btn btn-primary"
                                                style={{ backgroundColor: '#f1c2d5', borderColor: '#f1c2d5', color: '#090027' }}
                                            >
                                                <FaEdit />
                                            </Link>
                                            {!selectedEvent.hideButton && (
                                                <button
                                                    onClick={() => {
                                                        if (window.confirm("¿Estás seguro de recibir el pago $$$?")) {
                                                            updateEventAndCreateSale(selectedEvent.id);
                                                        }
                                                    }}
                                                    className='btn btn-success'
                                                    style={{ backgroundColor: '#d091ab', borderColor: '#d091ab', color: '#090027' }}
                                                >
                                                    <FaDollarSign />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => {
                                                    if (window.confirm("¿Estás seguro de que deseas eliminar esta cita?")) {
                                                        deleteEvent(selectedEvent.id);
                                                    }
                                                }}
                                                className='btn btn-danger'
                                                style={{ backgroundColor: '#c06389', borderColor: '#c06389', color: '#090027' }}
                                            >
                                                <FaTrash />
                                            </button>
                                        </div> */}
                                    </>
                                ) : (
                                    <p>No hay información del evento seleccionado.</p>
                                )}
                            </>
                        )}
                    </div>
                </Modal>

                {/* Calendario */}
                {!showQR ? (
                    <div className={`Containder calendar ${calendarView}`}>
                        <Calendar
                            style={{ color: 'white' }}
                            localizer={localizer}
                            events={calendarView === 'month' ? groupedEvents : events} // Usar eventos agrupados o individuales
                            className={calendarView === 'day' ? 'rbc-day-view' : ''}
                            startAccessor="start"
                            endAccessor="end"
                            view={calendarView}
                            date={selectedDate}
                            onView={setCalendarView}
                            onNavigate={(newDate) => setSelectedDate(newDate)}
                            selectable
                            messages={messages}
                            onSelectSlot={handleSelectSlot}
                            onSelectEvent={handleEventClick}
                            min={dayjs('2024-05-28T08:00:00').toDate()}
                            max={dayjs('2024-05-28T21:00:00').toDate()}
                            longPressThreshold={80}
                            components={{
                                toolbar: CustomToolbar,
                                event: ({ event }) => (
                                    <div
                                        style={{ backgroundColor: event.color || '#99d2ef', padding: '5px', borderRadius: '4px' }}
                                    >
                                        {calendarView === 'month' ? event.title : event.employee}
                                    </div>
                                ),
                            }}
                        />
                    </div>
                ) : (
                    <div className='Container-qr'>
                        {/* Contenedor principal con imagen de fondo y layout */}
                        <img
                            src={imagenQr}
                            alt="Fondo"
                            className="qr-logo-image2"
                        />
                        {/* Layout de 3 secciones (logo, QR, info) */}
                        <div className="qr-layout-container">
                            {/* Sección superior - Logo */}
                            <div className="qr-logo-section">
                                <img
                                    src={ClickCita}
                                    alt="Logo"
                                    className="qr-logo-image"
                                />
                            </div>

                            {/* Sección central - QR y plan */}
                            <div className="qr-code-section">
                                <div className="qr-info-username">{username}</div>
                                <GeneratorQr />
                                <div className="qr-info-url-container"> {/* Nuevo contenedor flex */}
                                    <span className="qr-info-url">{FRONTEND_URL}/{username}</span>
                                    <button
                                        onClick={handleCopyUrl}
                                        className="copy-url-button"
                                        aria-label="Copiar URL"
                                    >
                                        <FaRegCopy size={25} style={{ color: '#ffffff' }} />
                                    </button>
                                </div>
                                {isCopied && (
                                    <div className="copy-notification">URL copiada al portapapeles! 📋</div>
                                )}
                            </div>

                            {/* Sección inferior - Información */}
                            <div className="qr-info-section">
                                <div className="qr-info-value">Nombre</div>
                                <div className="qr-info-label">{businessData.nombreNegocio}</div>

                                <div className="qr-info-value">Direccion</div>
                                <div className="qr-info-label">{businessData.direccionNegocio}</div>

                                <div className="qr-info-value">WhatsApp</div>
                                <div className="qr-info-label">{businessData.whatsapp}</div>
                            </div>
                        </div>
                        {/* Botón para cerrar la vista del QR */}
                        <button
                            onClick={toggleQRView}
                            className="btn btn-secondary qr-close-button"
                        >
                            Cerrar
                        </button>
                    </div>
                )}
            </div>
            <Footer />
        </div>
    );
};

const EventComponent = ({ event, onClick }) => {
    if (!event) {
        return null; // No renderizar nada si el evento es null
    }

    return (
        <div
            style={{ backgroundColor: event.color || '#99d2ef', padding: '5px', borderRadius: '4px' }}
            onClick={onClick}
        >
            <span>{event.employee}</span>
        </div>
    );
};

export default CalendarPageUser;