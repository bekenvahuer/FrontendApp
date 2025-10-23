import React, { useEffect, useState, useMemo } from 'react';
import { Calendar as CalendarPending, dayjsLocalizer, Views } from 'react-big-calendar';
import "react-big-calendar/lib/css/react-big-calendar.css";
import { FaDollarSign } from 'react-icons/fa';
import dayjs from "dayjs";
import "dayjs/locale/es";
import './CSS/CalendarPage.css';
import SidebarPending from './SidebarPending';
import Carrucel from './Carrucel';
import FooterPending from './FooterPending';

dayjs.locale("es");
const localizer = dayjsLocalizer(dayjs);

const PendingTasks = () => {
    const [events, setEvents] = useState([]);
    const [calendarView, setCalendarView] = useState('month');
    const [selectedDate, setSelectedDate] = useState(new Date());

    // Datos de ejemplo para mostrar visualmente
    useEffect(() => {
        const sampleEvents = [
            {
                start: new Date(2024, 5, 10, 10, 0),
                end: new Date(2024, 5, 10, 11, 0),
                id: 1,
                title: "Corte de pelo / Juan Pérez",
                employee: "Pendiente de pago",
                color: '#ff9999',
                paymentPending: true
            },
            {
                start: new Date(2024, 5, 12, 14, 0),
                end: new Date(2024, 5, 12, 15, 30),
                id: 2,
                title: "Manicura / María García",
                employee: "Pendiente de pago",
                color: '#ff9999',
                paymentPending: true
            },
            {
                start: new Date(2024, 5, 15, 9, 0),
                end: new Date(2024, 5, 15, 10, 0),
                id: 3,
                title: "Masaje / Carlos López",
                employee: "Pendiente de pago",
                color: '#ff9999',
                paymentPending: true
            }
        ];

        setEvents(sampleEvents);
    }, []);

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
        noEventsInRange: "No hay eventos pendientes de pago",
        showMore: (total) => `+ Ver más (${total})`,
    };

    // Solo mostrar eventos pendientes de pago
    const pendingEvents = useMemo(() => {
        return events.filter(event => event.paymentPending);
    }, [events]);

    const firstName = "Administrador"; // Valor fijo para demostración
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
    const formattedName = firstName.charAt(0).toUpperCase() + firstName.slice(1).toLowerCase();

    return (
        <div className='Container-calendar'>
            <SidebarPending setCalendarView={setCalendarView} />
            <Carrucel />

            <div className='Title-calendar-cont'>
                <h1 className='Title-calendar pending-pulse'>Pendiente por Activar</h1>
            </div>

            <div className={`Containder calendar ${calendarView}`}>
                <h1 className='Title-calendar pending-pulse'>Pendiente por Activar</h1>
                <CalendarPending
                    style={{ color: 'white' }}
                    localizer={localizer}
                    events={pendingEvents}
                    className={calendarView === 'day' ? 'rbc-day-view' : ''}
                    startAccessor="start"
                    endAccessor="end"
                    view={calendarView}
                    date={selectedDate}
                    onView={setCalendarView}
                    onNavigate={(newDate) => setSelectedDate(newDate)}
                    messages={messages}
                    min={dayjs('2024-05-28T08:00:00').toDate()}
                    max={dayjs('2024-05-28T21:00:00').toDate()}
                    components={{
                        toolbar: CustomToolbar,
                        event: ({ event }) => (
                            <div
                                style={{
                                    backgroundColor: event.color || '#ff9999',
                                    padding: '5px',
                                    borderRadius: '4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '5px'
                                }}
                            >
                                <FaDollarSign />
                                <span>{event.employee}</span>
                            </div>
                        ),
                    }}
                />
            </div>

            <FooterPending />
        </div>
    );
};

export default PendingTasks;