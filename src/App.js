import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useParams } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import axios from 'axios'; // Añadido import de axios
import { useUserRole } from './components/useUserRole';
import AdminRoute from './components/AdminRoute';
import Sidebar from './components/Sidebar';
import Login from './components/Login';
import PendingTasks from './components/PendingTasks';
import TestFormFree from './components/TestFormFree';
import TestFormQrBancolombia from './components/TestFormQrBancolombia';
import TestForm1Mes from './components/TestForm1Mes';
import TestForm3Meses from './components/TestForm3Meses';
import TestForm6Meses from './components/TestForm6Meses';
import CalendarPage from './components/CalendarPage';
import CalendarPageUser from './components/CalendarPageUser';
import CalendarPageEmp from './components/CalendarPageEmp';
import ShowProducts from './components/ShowProducts';
import CreateProduct from './components/CreateProduct';
import EditProduct from './components/EditProduct';
import CreateEvent from './components/CreateEvent';
import CustomPage from './components/CustomPage';
import CreateEventUser from './components/CreateEventUser';
import EditEvent from './components/EditEvent';
import ShowUsers from './components/ShowUsers';
import EditUser from './components/EditUser';
import CreateUser from './components/CreateUser';
import ShowServices from './components/ShowServices';
import EditService from './components/EditService';
import CreateService from './components/CreateService';
import ShowPayrolls from './components/ShowPayroll';
import ShowSales from './components/ShowSales';
import CreateWorkingHours from './components/CreateWorkingHours';
import ResponseUrlePayco from './components/ResponseUrlePayco';
import './App.css';



const clientId = "497111658129-00lq5g6punqiimgg1lcohtkcotr9qar4.apps.googleusercontent.com";

function App() {
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isAuthenticated, setIsAuthenticated] = useState(localStorage.getItem('isAuthenticated') === 'true');
    const { loading, userId, username } = useUserRole();
    const [currentRole, setCurrentRole] = useState(null);
    const [currentPendingTasks, setCurrentPendingTasks] = useState(null);
    const [dataLoaded, setDataLoaded] = useState(false);

    // Función para manejar el toggle del sidebar
    const handleSidebarToggle = (isCollapsed) => {
        setIsSidebarCollapsed(isCollapsed);
    };

    // Función para obtener un username seguro
    const getSafeUsername = () => {
        return username || localStorage.getItem('idAdminKey') || 'default';
    };

    // Efecto para cargar y procesar datos del usuario
    useEffect(() => {
        if (!isAuthenticated) {
            setDataLoaded(true);
            return;
        }

        // Obtenemos los datos directamente de localStorage (que vienen de completedData.IdAdmin)
        const role = localStorage.getItem('rol') || 'User';
        const pending = localStorage.getItem('pendingTasks') === 'true';

        setCurrentRole(role);
        setCurrentPendingTasks(pending);
        setDataLoaded(true);
    }, [isAuthenticated]);

    useEffect(() => {
        const handleStorageChange = () => {
            setIsAuthenticated(localStorage.getItem('isAuthenticated') === 'true');
        };
        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const getRedirectPath = () => {
        if (!isAuthenticated) return '/login';

        if (!dataLoaded || currentRole === null || currentPendingTasks === null) {
            return null;
        }

        const safeUsername = getSafeUsername();


        if (currentRole === 'Admin' && currentPendingTasks) {

            return '/PendingTasks';
        }

        switch (currentRole) {
            case 'User':
                return `/${safeUsername}/calendarUser`;
            case 'Emp':
                return `/${safeUsername}/calendarEmp`;
            case 'Admin':
                return `/${safeUsername}/calendar`;
            default:
                return `/${safeUsername}/calendar`;
        }
    };

    // Mostrar loading screen hasta que todos los datos estén listos
    if ((loading || !dataLoaded) && isAuthenticated) {
        return (
            <div className="loading-screen" style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '100vh',
                backgroundColor: '#f5f5f5'
            }}>
                <div style={{
                    textAlign: 'center',
                    padding: '2rem',
                    borderRadius: '8px',
                    backgroundColor: 'white',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
                }}>
                    <h2>Cargando tu panel...</h2>
                    <p>Por favor espera mientras cargamos tus datos</p>
                    <div className="spinner" style={{
                        border: '4px solid rgba(0, 0, 0, 0.1)',
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        borderLeftColor: '#09f',
                        animation: 'spin 1s linear infinite',
                        margin: '20px auto'
                    }}></div>
                </div>

                <style>{`
                    @keyframes spin {
                        0% { transform: rotate(0deg); }
                        100% { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        );
    }

    const redirectPath = getRedirectPath();

    return (
        <GoogleOAuthProvider clientId={clientId}>
            <BrowserRouter>
                <div className="App" style={{ display: 'flex' }}>
                    {isAuthenticated && (
                        <div className={`sidebar-container ${isSidebarCollapsed ? 'collapsed' : ''}`}>
                            <Sidebar onToggle={handleSidebarToggle} />
                        </div>
                    )}
                    <div className={`content-container ${isSidebarCollapsed ? 'expanded' : ''}`}>
                        <Routes>
                            <Route path="/ResponseUrlePayco" element={<ResponseUrlePayco />} />
                            <Route path="/PendingTasks" element={<PendingTasks />} />
                            <Route path="/Free" element={<TestFormFree />} />
                            <Route path="/QrBancolombia" element={<TestFormQrBancolombia />} />
                            <Route path="/1Mes" element={<TestForm1Mes />} />
                            <Route path="/3Meses" element={<TestForm3Meses />} />
                            <Route path="/6Meses" element={<TestForm6Meses />} />
                            <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
                            <Route path="/unirse2" element={<CustomPage />} />
                            <Route path="/test" element={<CustomPage />} />
                            <Route path="/:adminKey" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
                            <Route path="/" element={<Navigate to={getRedirectPath()} replace />} />

                            {isAuthenticated && (
                                <>
                                    <Route
                                        path="/:username/*"
                                        element={
                                            currentRole === 'Admin' && currentPendingTasks ? (
                                                <Navigate to="/PendingTasks" replace />
                                            ) : (
                                                <Routes>
                                                    <Route
                                                        path="/calendar"
                                                        element={
                                                            currentRole === 'Admin' ? (
                                                                <CalendarPage />
                                                            ) : currentRole === 'Emp' ? (
                                                                <Navigate to={`/${getSafeUsername()}/calendarEmp`} replace />
                                                            ) : (
                                                                <Navigate to={`/${getSafeUsername()}/calendarUser`} replace />
                                                            )
                                                        }
                                                    />
                                                    <Route
                                                        path="/calendarUser"
                                                        element={
                                                            currentRole === 'User' ? (
                                                                <CalendarPageUser />
                                                            ) : (
                                                                <Navigate to={getRedirectPath()} replace />
                                                            )
                                                        }
                                                    />
                                                    <Route
                                                        path="/calendarEmp"
                                                        element={
                                                            currentRole === 'Emp' ? (
                                                                <CalendarPageEmp />
                                                            ) : (
                                                                <Navigate to={getRedirectPath()} replace />
                                                            )
                                                        }
                                                    />

                                                    {/* Rutas para Admin */}
                                                    {currentRole === 'Admin' && !currentPendingTasks && (
                                                        <>
                                                            <Route path="/products" element={<AdminRoute><ShowProducts /></AdminRoute>} />
                                                            <Route path="/create" element={<AdminRoute><CreateProduct /></AdminRoute>} />
                                                            <Route path="/edit/:id" element={<AdminRoute><EditProduct /></AdminRoute>} />
                                                            <Route path="/events/edit/:id" element={<AdminRoute><EditEvent /></AdminRoute>} />
                                                            <Route path="/users" element={<AdminRoute><ShowUsers /></AdminRoute>} />
                                                            <Route path="/users/edit/:id" element={<AdminRoute><EditUser /></AdminRoute>} />
                                                            <Route path="/users/create" element={<AdminRoute><CreateUser /></AdminRoute>} />
                                                            <Route path="/services" element={<AdminRoute><ShowServices /></AdminRoute>} />
                                                            <Route path="/services/create" element={<AdminRoute><CreateService /></AdminRoute>} />
                                                            <Route path="/services/edit/:id" element={<AdminRoute><EditService /></AdminRoute>} />
                                                            <Route path="/payrolls" element={<AdminRoute><ShowPayrolls /></AdminRoute>} />
                                                            <Route path="/sales" element={<AdminRoute><ShowSales /></AdminRoute>} />
                                                            <Route path="/workingHours" element={<AdminRoute><CreateWorkingHours /></AdminRoute>} />
                                                        </>
                                                    )}

                                                    {/* Rutas para eventos accesibles según rol */}
                                                    <Route
                                                        path="/events/create"
                                                        element={
                                                            currentRole === 'Admin' ? (
                                                                <AdminRoute><CreateEvent /></AdminRoute>
                                                            ) : currentRole === 'User' ? (
                                                                <CreateEventUser />
                                                            ) : (
                                                                <Navigate to="/unauthorized" replace />
                                                            )
                                                        }
                                                    />

                                                    <Route
                                                        path="/events/createUser"
                                                        element={
                                                            currentRole === 'User' ? (
                                                                <CreateEventUser />
                                                            ) : (
                                                                <Navigate to="/unauthorized" replace />
                                                            )
                                                        }
                                                    />

                                                    {/* Rutas para otros roles si es necesario */}
                                                    {currentRole === 'Emp' && (
                                                        <>
                                                            {/* Agrega aquí rutas específicas para empleados si es necesario */}
                                                        </>
                                                    )}

                                                    <Route path="*" element={<Navigate to={getRedirectPath()} replace />} />
                                                </Routes>
                                            )
                                        }
                                    />
                                </>
                            )}

                            <Route path="*" element={<Navigate to={getRedirectPath()} replace />} />
                        </Routes>
                    </div>
                </div>
            </BrowserRouter>
        </GoogleOAuthProvider>
    );
}

export default App;