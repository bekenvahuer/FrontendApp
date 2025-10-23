import React, { useState, useEffect } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import "./CSS/Login.css";
import imagenLogin1 from "./login-image1.png";
import imagenLogin2 from "./login-image2.png";
import imagenLogin3 from "./login-image3.png";
import imagenLogin4 from "./login-image4.png";
import imagenLogin5 from "./login-image5.png";
import Footer from "./Footer";
import { GoogleLogin } from "@react-oauth/google";
import { loginWithGoogle } from "./Api";
import DOMPurify from "dompurify";
import axios from "axios";
import ResponseUrlePayco from "./ResponseUrlePayco"; // Importar el componente
import { API_BASE_URL } from "./config";
import { FRONTEND_URL } from "./config";

const Login = ({ setIsAuthenticated }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { adminKey } = useParams(); // Capturar adminKey desde la URL
    const [error, setError] = useState(null);
    const [currentImage, setCurrentImage] = useState(0);
    const [transactionState, setTransactionState] = useState(null); // Nuevo estado para x_transaction_state
    const [transactionDate, setTransactionDate] = useState(null); // Nuevo estado para x_fecha_transaccion
    const [refPaycoProcessed, setRefPaycoProcessed] = useState(false); // Estado para manejar si ref_payco ya fue procesado
    const [transactionMessage, setTransactionMessage] = useState(null); // Mensaje sobre el estado de la transacción
    const [additionalData, setAdditionalData] = useState({}); // Estado para additionalData
    const images = [imagenLogin1, imagenLogin2, imagenLogin3, imagenLogin4, imagenLogin5];

    // Cambiar imágenes cada 3 segundos
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImage((prevImage) => (prevImage + 1) % images.length);
        }, 3000);
        return () => clearInterval(interval);
    }, [images.length]);

    // Función para manejar el resultado de ResponseUrlePayco
    const handleProcessComplete = ({ transactionState, transactionDate, refPayco }) => {

        setTransactionState(transactionState);
        setTransactionDate(transactionDate);
        setRefPaycoProcessed(true); // Marcar como procesado

        // Verificar el estado de la transacción
        if (transactionState === "Aceptada") {

            setTransactionMessage(null); // Limpiar mensaje de error

            // Actualizar el JSON con los datos de la transacción
            const completedData = completeJSON(additionalData, refPayco, transactionDate);

        } else {
            // Mostrar mensaje de error y evitar que el usuario continúe
            setTransactionMessage(`Su transacción fue "${transactionState}". No se puede continuar.`);

        }
    };


    // Lógica principal con switch-case
    useEffect(() => {
        const queryParams = new URLSearchParams(location.search);
        const refPayco = queryParams.get("ref_payco");

        switch (true) {
            case refPayco !== null && !refPaycoProcessed:

                // No es necesario hacer nada más aquí, ya que ResponseUrlePayco se encargará
                break;

            case location.state?.postData !== undefined:
                const postData = location.state.postData;
                const idAdminKey = Object.keys(postData.IdAdmin)[0];

                if (!idAdminKey || !idAdminKey.startsWith('@')) {
                    window.location.href = "/unirse2";
                    break;
                }

                break;

            case !adminKey || !adminKey.startsWith('@'):
                window.location.href = "/unirse2";
                break;

            default:

        }
    }, [location.state, adminKey, location.search, refPaycoProcessed]);

    // Función para obtener el idAdminKey real desde el campo skills
    const getRealIdAdminKey = (userData) => {
        if (userData.skills && userData.skills.length > 0) {
            const skillsData = userData.skills[0]; // Acceder al primer elemento del array skills
            if (skillsData.IdAdmin) {
                const idAdminKey = Object.keys(skillsData.IdAdmin)[0]; // Obtener la primera clave de IdAdmin
                return idAdminKey !== "IdAdminToBeDefined" ? idAdminKey : "IdAdminToBeDefined";
            }
        }
        return "IdAdminToBeDefined"; // Si no hay información válida, mantener el valor por defecto
    };

    // Función para completar el JSON con valores por defecto
    const completeJSON = (data, refPayco, transactionDate) => {


        // Intentar recuperar la fecha de localStorage si transactionDate es inválido
        const storedTransactionDate = localStorage.getItem("transactionDate");

        const userData = JSON.parse(localStorage.getItem('user'));
        const rawDate = userData?.created_at;
        const formattedDefaultDate = rawDate
            ? rawDate.replace('T', ' ').split('.')[0]
            : "";

        const fechaValida = (transactionDate && transactionDate !== "null" && transactionDate !== undefined)
            ? transactionDate
            : (storedTransactionDate && storedTransactionDate !== "null" && storedTransactionDate !== undefined)
                ? storedTransactionDate
                : formattedDefaultDate;



        const defaultData = {
            rol: "Admin",
            skills: ["null"],
            comprobanteDePago: refPayco || "null",
            planDePago: "null",
            nombreNegocio: "null",
            whatsapp: "null",
            direccionNegocio: "null",
            ciudad: "null",
            pais: "CO",
            fechaTransaccion: fechaValida, // 🔹 Ahora siempre tendrá un valor válido
        };



        if (!data.IdAdmin) {
            data.IdAdmin = { IdAdminToBeDefined: defaultData };
        } else {
            const idAdminKey = Object.keys(data.IdAdmin)[0];

            const fechaTransaccionFinal = data.IdAdmin[idAdminKey]?.fechaTransaccion &&
                data.IdAdmin[idAdminKey]?.fechaTransaccion !== "null" &&
                data.IdAdmin[idAdminKey]?.fechaTransaccion !== undefined
                ? data.IdAdmin[idAdminKey].fechaTransaccion
                : fechaValida; // ✅ Asegurar que se usa una fecha válida

            data.IdAdmin[idAdminKey] = {
                rol: data.IdAdmin[idAdminKey]?.rol || defaultData.rol,
                skills: data.IdAdmin[idAdminKey]?.skills || defaultData.skills,
                comprobanteDePago: data.IdAdmin[idAdminKey]?.comprobanteDePago || defaultData.comprobanteDePago,
                planDePago: data.IdAdmin[idAdminKey]?.planDePago || defaultData.planDePago,
                nombreNegocio: data.IdAdmin[idAdminKey]?.nombreNegocio || defaultData.nombreNegocio,
                whatsapp: data.IdAdmin[idAdminKey]?.whatsapp || defaultData.whatsapp,
                direccionNegocio: data.IdAdmin[idAdminKey]?.direccionNegocio || defaultData.direccionNegocio,
                ciudad: data.IdAdmin[idAdminKey]?.ciudad || defaultData.ciudad,
                pais: data.IdAdmin[idAdminKey]?.pais || defaultData.pais,
                fechaTransaccion: fechaTransaccionFinal, // ✅ Corregido
            };
        }



        return data;
    };







    // Función para clasificar los casos
    const classifyCase = (userJSON) => {
        const casos = [
            { Caso: 1, planDePago: "Free", comprobanteDePago: "null", IdAdmin: "IdAdminToBeDefined", Accion1: "logicaFree" },
            { Caso: 2, planDePago: "no_null", comprobanteDePago: "no_null", IdAdmin: "IdAdminToBeDefined", Accion1: "adminForm" },
            { Caso: 3, planDePago: "null", comprobanteDePago: "null", IdAdmin: "Con IdAdmin", Accion1: "LogicaRol" },
            { Caso: 4, planDePago: "Free", comprobanteDePago: "no_null", IdAdmin: "IdAdminToBeDefined", Accion1: "logicaFree" },
            { Caso: 5, planDePago: "null", comprobanteDePago: "null", IdAdmin: "IdAdminToBeDefined", Accion1: "newPage" },
            { Caso: 6, planDePago: "no_null", comprobanteDePago: "no_null", IdAdmin: "Con IdAdmin", Accion1: "LogicaRol" },
            { Caso: 7, planDePago: "no_null", comprobanteDePago: "null", IdAdmin: "IdAdminToBeDefined", Accion1: "logicaFree" },
            { Caso: 8, planDePago: "no_null", comprobanteDePago: "null", IdAdmin: "Con IdAdmin", Accion1: "logicaFree" },
            { Caso: 9, planDePago: "Free", comprobanteDePago: "null", IdAdmin: "Con IdAdmin", Accion1: "logicaFree" },
            { Caso: 10, planDePago: "Free", comprobanteDePago: "no_null", IdAdmin: "Con IdAdmin", Accion1: "logicaFree" },
            { Caso: 11, planDePago: "null", comprobanteDePago: "no_null", IdAdmin: "Con IdAdmin", Accion1: "logicaFree" },
            { Caso: 12, planDePago: "null", comprobanteDePago: "no_null", IdAdmin: "IdAdminToBeDefined", Accion1: "logicaFree" },
        ];

        const idAdminKey = Object.keys(userJSON.IdAdmin)[0];
        const planDePago = userJSON.IdAdmin[idAdminKey]?.planDePago === "Free"
            ? "Free"
            : (userJSON.IdAdmin[idAdminKey]?.planDePago === "null"
                ? "null"
                : "no_null");
        const comprobanteDePago = userJSON.IdAdmin[idAdminKey]?.comprobanteDePago === "null"
            ? "null"
            : "no_null";
        const IdAdmin = idAdminKey === "IdAdminToBeDefined"
            ? "IdAdminToBeDefined"
            : (idAdminKey ? "Con IdAdmin" : "IdAdminToBeDefined");

        const casoUsuario = casos.find(
            (caso) =>
                caso.planDePago === planDePago &&
                caso.comprobanteDePago === comprobanteDePago &&
                caso.IdAdmin === IdAdmin
        );

        return casoUsuario;
    };

    // Función para manejar la lógica de redirección según el rol
    const LogicaRol = (idAdminKey, rol) => {

        switch (rol) {
            case "User":
                navigate(`/${idAdminKey}/calendarUser`);

                break;
            case "Admin":
                navigate(`/${idAdminKey}/calendar`);

                break;
            case "Emp":
                navigate(`/${idAdminKey}/calendarEmp`);

                break;
            default:
                navigate(`/${idAdminKey}/calendarUser`);

        }
    };

    // Función para extraer el rol desde skills
    const extractRoleFromSkills = (userData) => {
        try {
            if (userData.skills && userData.skills.length > 0) {
                const skillsData = userData.skills[0];
                if (skillsData.IdAdmin) {
                    const adminKey = Object.keys(skillsData.IdAdmin)[0];
                    return skillsData.IdAdmin[adminKey]?.rol || 'User';
                }
            }
            return 'User'; // Valor por defecto
        } catch (error) {
            console.error('Error extrayendo rol:', error);
            return 'User';
        }
    };
    // Función para extraer pendingTasks desde skills
    const extractPendingTasks = (userData) => {
        try {
            // 1. Buscar en la nueva clave específica primero
            const hasPendingTasks = localStorage.getItem("cc_pending_tasks") === "true";
            if (hasPendingTasks) {
                return true;
            }

            // 2. Lógica existente como fallback
            if (userData.skills && userData.skills.length > 0) {
                const skillsData = userData.skills[0];
                if (skillsData.IdAdmin) {
                    const adminKey = Object.keys(skillsData.IdAdmin)[0];
                    return skillsData.IdAdmin[adminKey]?.pendingTasks || false;
                }
            }
            return false;
        } catch (error) {
            console.error('Error extrayendo pendingTasks:', error);
            return false;
        }
    };

    const getUserById = async (userId) => {
        try {
            const accessToken = localStorage.getItem("accessToken");
            const response = await axios.get(
                `${API_BASE_URL}/users/${userId}`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );
            return response.data;
        } catch (error) {
            console.error("Error al obtener el usuario actualizado:", error);
            throw error;
        }
    };


    // Función para manejar el login con Google
    const handleGoogleLogin = async (credentialResponse) => {
        try {
            // Guardar el valor de cc_pending_tasks antes de limpiar
            const pendingTasksValue = localStorage.getItem("cc_pending_tasks");

            // Limpieza selectiva (en lugar de clear())
            const keysToKeep = ["cc_pending_tasks"]; // Claves que NO se borrarán
            Object.keys(localStorage).forEach(key => {
                if (!keysToKeep.includes(key)) {
                    localStorage.removeItem(key); // Borra solo las claves no incluidas en keysToKeep
                }
            });

            // Autenticar con Google
            const data = await loginWithGoogle(credentialResponse.credential);
            

            // Verificar datos del usuario recibidos desde la API
            if (!data || !data.user || !data.user.id) {
                const userId = data?.user?.id || data?.id || data?.data?.user?.id;
                if (!userId) {
                    throw new Error("No se recibieron datos válidos del usuario");
                }
                data.user = data.user || { id: userId };
            }

            // Obtener el usuario actualizado desde la API
            const updatedUser = await getUserById(data.user.id);

            // Extraer pendingTasks desde skills del usuario actualizado (mantenemos esto)
            const userPendingTasks = extractPendingTasks(updatedUser);

            // Almacenar datos en localStorage
            localStorage.setItem("isAuthenticated", "true");
            setIsAuthenticated(true);
            localStorage.setItem("user", JSON.stringify(updatedUser));
            localStorage.setItem("accessToken", data.access_token);
            localStorage.setItem("userId", updatedUser.id);
            localStorage.setItem("idAdminKey", updatedUser.username || adminKey);
            localStorage.setItem("pendingTasks", userPendingTasks);

            // Capturar datos adicionales
            const queryParams = new URLSearchParams(location.search);
            const postData = location.state?.postData;


            let additionalData = {};

            if (postData) {
                additionalData = {
                    ...postData,
                    pendingTasks: postData.pendingTasks !== undefined ? postData.pendingTasks : false
                };
            } else {
                if (updatedUser.skills && updatedUser.skills.length > 0) {
                    additionalData = updatedUser.skills[0];
                } else {
                    additionalData = {
                        IdAdmin: {
                            [adminKey ?? "IdAdminToBeDefined"]: {
                                rol: queryParams.get("rol") || "User",
                                skills: queryParams.get("skills")?.split(",") || ["null"],
                                comprobanteDePago: queryParams.get("comprobanteDePago") || "null",
                                planDePago: queryParams.get("planDePago") || "null",
                                nombreNegocio: queryParams.get("nombreNegocio") || "null",
                                whatsapp: queryParams.get("whatsapp") || "null",
                                direccionNegocio: queryParams.get("direccionNegocio") || "null",
                                ciudad: queryParams.get("ciudad") || "null",
                                pais: queryParams.get("pais") || "null",
                                fechaTransaccion: queryParams.get("fechaTransaccion") || "null",
                            },
                        },
                    };
                }
            }

            // Completar el JSON con valores por defecto
            const completedData = completeJSON(additionalData);

            // Obtener el idAdminKey real desde el campo skills del usuario
            const realIdAdminKey = getRealIdAdminKey(updatedUser);

            if (realIdAdminKey !== "IdAdminToBeDefined") {
                completedData.IdAdmin = {
                    [realIdAdminKey]: completedData.IdAdmin[Object.keys(completedData.IdAdmin)[0]],
                };
            }

            const idAdminKeyFromData = Object.keys(completedData.IdAdmin)[0];

            // Obtener el ROL directamente del JSON completado
            const userRole = completedData.IdAdmin[idAdminKeyFromData].rol;
            localStorage.setItem("rol", userRole); // Almacenamos el rol del JSON

            // Actualizar el campo `skills` del usuario
            const finalUser = await updateUserSkills(updatedUser.id, completedData, postData);

            let userForRedirection = finalUser;
            if (postData || !updatedUser.skills || updatedUser.skills.length === 0) {
                userForRedirection = await getUserById(updatedUser.id);
            }

            // Clasificar el JSON según los casos
            const casoUsuario = classifyCase(completedData);

            // Redirigir según el caso
            if (casoUsuario) {
                // Usamos directamente el rol que ya obtuvimos del JSON
                const rol = userRole;

                switch (casoUsuario.Accion1) {
                    case "logicaFree":
                        if (casoUsuario.Caso === 1) {
                            window.location.href = "/test";
                        } else {
                            navigate(`/${idAdminKeyFromData}/calendar`);
                        }
                        break;
                    case "adminForm":
                        window.location.href = "/test";
                        break;
                    case "newPage":
                        window.location.href = "/unirse2";
                        break;
                    case "LogicaRol":
                        // Usamos el rol del JSON sin necesidad de volver a consultar
                        LogicaRol(idAdminKeyFromData, rol);
                        break;
                    default:
                        navigate(`/${idAdminKeyFromData}/calendar`);
                }
            }
        } catch (error) {
            setError(error.message || "Error en el inicio de sesión");
            console.error("Error en handleGoogleLogin:", error);
            if (error.response) {
                console.error("Error response data:", error.response.data);
            }
        }
    };

    const updateUserSkills = async (userId, skillsData, postData) => {
        try {
            const accessToken = localStorage.getItem("accessToken");

            // Obtener los datos actuales del usuario
            const userResponse = await axios.get(
                `${API_BASE_URL}/users/${userId}`,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );

            const userData = userResponse.data;

            // Verificar si el campo `skills` ya tiene información
            if (userData.skills && userData.skills.length > 0) {

                return; // Dejar que el flujo continúe normalmente
            }

            // Si el campo `skills` está vacío, usar los datos que llegan por POST (skillsData)
            const idAdminKey = Object.keys(skillsData.IdAdmin)[0]; // Obtener el idAdminKey del JSON recibido
            const updatedSkillsData = {
                IdAdmin: {
                    [idAdminKey]: {
                        rol: skillsData.IdAdmin[idAdminKey]?.rol || "User", // Usar el rol de skillsData o "User" por defecto
                        skills: skillsData.IdAdmin[idAdminKey]?.skills || ["null"], // Usar las skills de skillsData o ["null"] por defecto
                        comprobanteDePago: skillsData.IdAdmin[idAdminKey]?.comprobanteDePago || "null", // Usar el comprobante de skillsData o "null" por defecto
                        planDePago: skillsData.IdAdmin[idAdminKey]?.planDePago || "null", // Usar el plan de pago de skillsData o "null" por defecto
                        nombreNegocio: skillsData.IdAdmin[idAdminKey]?.nombreNegocio || "null", // Usar el nombre de negocio de skillsData o "null" por defecto
                        whatsapp: skillsData.IdAdmin[idAdminKey]?.whatsapp || "null", // Usar el whatsapp de skillsData o "null" por defecto
                        direccionNegocio: skillsData.IdAdmin[idAdminKey]?.direccionNegocio || "null", // Usar la dirección de negocio de skillsData o "null" por defecto
                        ciudad: skillsData.IdAdmin[idAdminKey]?.ciudad || "null", // Usar la ciudad de skillsData o "null" por defecto
                        pais: skillsData.IdAdmin[idAdminKey]?.pais || "null", // Usar el país de skillsData o "null" por defecto
                        fechaTransaccion: skillsData.IdAdmin[idAdminKey]?.fechaTransaccion || "null",
                    },
                },
            };

            // Verificar el valor de `rol` en updatedSkillsData
            const isEmployee = updatedSkillsData.IdAdmin[idAdminKey]?.rol !== "User"; // true si el rol no es "User", false si es "User"
            const rolAdm = updatedSkillsData.IdAdmin[idAdminKey]?.rol;


            // Verificar si el rol es "admin"
            if (rolAdm === "Admin") {

                try {
                    const response = await axios.post(
                        `${API_BASE_URL}/business`,
                        {
                            user_id: userId,
                            data: JSON.stringify(updatedSkillsData)
                        },
                        {
                            headers: {
                                Authorization: `Bearer ${accessToken}`,
                                "Content-Type": "application/json",
                            },
                        }
                    );

                } catch (error) {
                    console.error("Error al crear negocio:", error.response?.data || error.message);
                }
            } else {

            }
            const skillRol = updatedSkillsData.IdAdmin[idAdminKey]?.rol || "User";
            // Asegurar que los campos requeridos estén presentes
            const updatedData = {
                name: userData.name || "Nombre de Usuario",
                email: userData.email || "usuario@example.com",
                date_of_birth: userData.date_of_birth || "2000-01-01",
                phone: userData.phone || "123456789",
                employee: skillRol !== "User", // verdadero si es Admin o Empleado
                pendingTasks: postData?.pendingTasks !== undefined
                    ? postData.pendingTasks
                    : skillsData?.pendingTasks || false,
                skills: [updatedSkillsData],
                rol: skillRol, // <-- Aquí sincronizas el rol principal
            };

            // Enviar la solicitud PUT para actualizar el usuario
            const response = await axios.put(
                `${API_BASE_URL}/users/${userId}`,
                updatedData,
                {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                    },
                }
            );


        } catch (error) {
            console.error("Error al actualizar skills:", error);
            if (error.response) {
                console.error("Detalles del error:", error.response.data);
            }
            throw error; // Relanzar el error para manejarlo en el flujo principal
        }
    };

    return (
        <div className="content-containerLogin">
            <div className="login-containerLogin">
                <div className="login-box">
                    <div className="login-image">
                        <img src={images[currentImage]} alt="Imagen Login" className="fade-in" />
                    </div>
                    <div className="login-form">
                        <h2>Iniciar Sesión con:</h2>
                        {error && <p className="error-message">{error}</p>}
                        {/* Mostrar mensaje de transacción si existe */}
                        {transactionMessage && (
                            <p className="transaction-message">{transactionMessage}</p>
                        )}
                        {/* Renderizar ResponseUrlePayco si hay ref_payco y no se ha procesado aún */}
                        {location.search.includes("ref_payco") && !refPaycoProcessed ? (
                            <ResponseUrlePayco onProcessComplete={handleProcessComplete} />
                        ) : (
                            // Mostrar el botón de Google Login solo si la transacción fue exitosa o no hay ref_payco
                            !transactionMessage && (
                                <GoogleLogin
                                    onSuccess={handleGoogleLogin}
                                    onError={() => setError("Error en Google Login")}
                                />
                            )
                        )}
                    </div>
                    <Footer />
                </div>
            </div>
        </div>
    );
};

export default Login;