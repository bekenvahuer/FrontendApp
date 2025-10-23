import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./CSS/Login2.css";
import Footer from "./Footer";
import imagenLogin1 from "./login-image1.png";
import imagenLogin2 from "./login-image2.png";
import imagenLogin3 from "./login-image3.png";
import imagenLogin4 from "./login-image4.png";
import imagenLogin5 from "./login-image5.png";
import ClickCita from "./ClickCita.png"; // Importa la imagen del logo
import imagenQr from "./qr15.webp"; // Importa la imagen de fondo del QR
import { FaRegCopy } from "react-icons/fa"; // Importa el icono de copiar
import { API_BASE_URL } from "./config";
import { FRONTEND_URL } from "./config";

const TestFormQrBancolombia = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Obtener el parámetro 'plan' de la URL
    const queryParams = new URLSearchParams(location.search);
    const planParam = queryParams.get('plan');

    // Determinar el plan basado en el parámetro
    const getPlanType = (param) => {
        switch (param) {
            case '1Mes':
                return { type: "1Mes", amount: "Pagar $14.999" };
            case '3Meses':
                return { type: "3Meses", amount: "Pagar $39.999" };
            case '6Meses':
            default:
                return { type: "6Meses", amount: "Pagar $59.999" };
        }
    };

    const selectedPlan = getPlanType(planParam);

    // Estado para manejar los valores del formulario
    const [formData, setFormData] = useState({
        rol: "Admin",
        skills: "",
        comprobanteDePago: "",
        planDePago: selectedPlan.type,
        IdAdmin: "",
        nombreNegocio: "",
        whatsapp: "",
        direccionNegocio: "",
        ciudad: "",
        pais: ""
    });

    const [showModal, setShowModal] = useState(false);
    const [showQRModal, setShowQRModal] = useState(false); // Nuevo estado para el modal del QR
    const [error, setError] = useState(null);
    const [currentImage, setCurrentImage] = useState(0);
    const [isCopied, setIsCopied] = useState(false); // Estado para controlar la notificación de copiado

    // Imágenes para el carrusel
    const images = [imagenLogin1, imagenLogin2, imagenLogin3, imagenLogin4, imagenLogin5];

    // Generar IdAdmin basado en las reglas establecidas
    const generateIdAdmin = (nombreNegocio, whatsapp) => {
        const cleanName = nombreNegocio.replace(/[^a-zA-Z0-9]/g, "");
        const trimmedName = cleanName.slice(0, 15);
        const lastFourDigits = whatsapp.slice(-4);
        return `@${trimmedName}${lastFourDigits}`;
    };

    // Efecto para cambiar las imágenes cada 3 segundos
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImage((prevImage) => (prevImage + 1) % images.length);
        }, 3000);
        return () => clearInterval(interval);
    }, [images.length]);

    // Efecto para generar el IdAdmin cuando cambian los campos relevantes
    useEffect(() => {
        const generatedIdAdmin = generateIdAdmin(formData.nombreNegocio, formData.whatsapp);
        setFormData((prevState) => ({
            ...prevState,
            IdAdmin: generatedIdAdmin,
        }));
    }, [formData.nombreNegocio, formData.whatsapp]);

    // Manejar cambios en los inputs
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name === "whatsapp") {
            if (/^\d{0,10}$/.test(value)) {
                setFormData({ ...formData, [name]: value });
                setError(null);
            } else {
                setError("El teléfono solo debe contener números y tener máximo 10 dígitos.");
            }
        } else if (name === "direccionNegocio") {
            const cleanedValue = value.replace(/[^a-zA-Z0-9\s]/g, "");
            setFormData({ ...formData, [name]: cleanedValue });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    // Mostrar el modal antes de enviar
    const handleShowModal = (e) => {
        e.preventDefault();
        if (error) {
            alert("Por favor, corrige el campo de WhatsApp antes de continuar.");
            return;
        }
        setShowModal(true);
    };

    // Función para manejar el cierre del modal del QR
    const handleCloseQRModal = () => {
        setShowQRModal(false);
        setIsCopied(false); // Resetear el estado de copiado al cerrar el modal
    };

    // Función para copiar la URL al portapapeles
    const handleCopyUrl = () => {
        const url = `${FRONTEND_URL}/${formData.IdAdmin}`;
        navigator.clipboard.writeText(url);
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000); // Ocultar la notificación después de 2 segundos
    };

    // Guardar datos en localStorage y mostrar el modal del QR
    const handleShowQR = () => {
        // Borrar datos anteriores en localStorage para evitar conflictos
        localStorage.removeItem("formData");
        localStorage.removeItem("cc_pending_tasks");

        // Guardar los datos del formulario
        localStorage.setItem("formData", JSON.stringify(formData));

        // Guardar pendingTasks por separado
        localStorage.setItem("cc_pending_tasks", "true");

        // Cerrar el modal de confirmación
        setShowModal(false);

        // Mostrar el modal del QR
        setShowQRModal(true);
    };
    useEffect(() => {
        const savedFormData = localStorage.getItem("formData");
        if (savedFormData) {
            setFormData(JSON.parse(savedFormData)); // Recuperar datos del localStorage
        }
    }, []);

    // Función combinada para cerrar modal y enviar datos
    const handleCloseAndSubmit = () => {
        // 1. Cerrar el modal
        setShowQRModal(false);

        // 2. Generar los datos a enviar
        const generatedIdAdmin = generateIdAdmin(formData.nombreNegocio, formData.whatsapp);
        const dataToSend = {
            pendingTasks: true, // Añadir este campo
            IdAdmin: {
                [generatedIdAdmin]: {
                    ...formData,
                    IdAdmin: generatedIdAdmin,
                },
            },
        };

        // 3. Redirigir a login con los datos
        navigate("/login", { state: { postData: dataToSend } });
    };

    return (
        <div className="content-containerLoginF">
            <div className="login-containerLoginF">
                <div className="login-boxF">
                    <div className="login-imageF">
                        <img src={images[currentImage]} alt="Imagen Login" className="fade-in" />
                    </div>
                    <div className="login-formF">
                        <form onSubmit={handleShowModal}>
                            <h1>Datos del Negocio</h1>
                            <fieldset>
                                <label htmlFor="nombreNegocio">Nombre del Negocio:</label>
                                <input
                                    type="text"
                                    id="nombreNegocio"
                                    name="nombreNegocio"
                                    value={formData.nombreNegocio}
                                    onChange={handleInputChange}
                                    placeholder="Ej: Mi Negocio"
                                    required
                                />
                                <label htmlFor="whatsapp">Whatsapp:</label>
                                <input
                                    type="text"
                                    id="whatsapp"
                                    name="whatsapp"
                                    value={formData.whatsapp}
                                    onChange={handleInputChange}
                                    placeholder="Ej: 3001234567"
                                    required
                                />
                                {error && <p style={{ color: "red" }}>{error}</p>}
                                <label htmlFor="direccionNegocio">Dirección del Negocio:</label>
                                <input
                                    type="text"
                                    id="direccionNegocio"
                                    name="direccionNegocio"
                                    value={formData.direccionNegocio}
                                    onChange={handleInputChange}
                                    placeholder="Ej: Calle 30A 82A 26"
                                    required
                                />
                                <label htmlFor="ciudad">Ciudad:</label>
                                <input
                                    type="text"
                                    id="ciudad"
                                    name="ciudad"
                                    value={formData.ciudad}
                                    onChange={handleInputChange}
                                    placeholder="Ej: Medellín"
                                    required
                                />
                            </fieldset>
                            <button type="submit">Enviar Datos</button>
                        </form>

                        {showModal && (
                            <div style={{
                                position: 'fixed',
                                top: '0',
                                left: '0',
                                width: '100%',
                                height: '100%',
                                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                zIndex: 1000
                            }}>
                                <div style={{
                                    backgroundColor: 'white',
                                    color: 'black',
                                    padding: '20px',
                                    borderRadius: '8px',
                                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                                    maxWidth: '500px',
                                    width: '90%'
                                }}>
                                    <h4>¿Estás de acuerdo con esta información?</h4>
                                    <p><strong>Nombre del Negocio:</strong> {formData.nombreNegocio}</p>
                                    <p><strong>Whatsapp:</strong> {formData.whatsapp}</p>
                                    <p><strong>Dirección del Negocio:</strong> {formData.direccionNegocio}</p>
                                    <p><strong>Ciudad:</strong> {formData.ciudad}</p>
                                    <p><strong>Plan de Pago:</strong> {formData.planDePago}</p>
                                    <p><strong>Valor:</strong> {selectedPlan.amount}</p>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                                        <button
                                            onClick={() => setShowModal(false)}
                                            style={{
                                                backgroundColor: '#d1beff',
                                                color: '#000',
                                                border: 'none',
                                                padding: '10px 20px',
                                                borderRadius: '5px',
                                                cursor: 'pointer',
                                                marginRight: '10px',
                                            }}
                                        >
                                            Editar
                                        </button>
                                        <button
                                            onClick={handleShowQR}
                                            style={{
                                                backgroundColor: '#a57fff',
                                                color: 'white',
                                                border: 'none',
                                                padding: '10px 20px',
                                                borderRadius: '5px',
                                                cursor: 'pointer',
                                            }}
                                        >
                                            Realizar Pago
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {showQRModal && (
                            <div className="qr2-modal-overlay">
                                <div className='Container-qr2'>
                                    {/* Layout de 3 secciones (logo, QR, info) */}
                                    <div className="qr2-layout-container">
                                        {/* Sección superior - Logo */}
                                        <div className="qr2-logo-section">
                                            <img
                                                src={ClickCita}
                                                alt="Logo2"
                                                className="qr2-logo-image"
                                            />
                                            <div className="qr2-plan-info">
                                                <div className="logo-info-value">Plan</div>
                                                <div className="logo-info-label">{formData.planDePago}</div>
                                            </div>
                                        </div>

                                        {/* Sección inferior - Información */}
                                        <div className="qr2-info-section">
                                            <div className="qr2-info-value">Nombre</div>
                                            <div className="qr2-info-label">{formData.nombreNegocio}</div>

                                            <div className="qr2-info-value">Direccion</div>
                                            <div className="qr2-info-label">{formData.direccionNegocio}</div>

                                            <div className="qr2-info-value">WhatsApp</div>
                                            <div className="qr2-info-label">{formData.whatsapp}</div>
                                        </div>

                                        {/* Sección central - QR y plan */}
                                        <div className="qr2-code-section">
                                            <div className="qr2-info-username">{selectedPlan.amount}</div>
                                            <div className="qr2-info-url-container">
                                                <span className="qr2-info-url">
                                                    {FRONTEND_URL}/{formData.IdAdmin}
                                                </span>
                                                <button
                                                    onClick={handleCopyUrl}
                                                    className="copy2-url-button"
                                                    aria-label="Copiar URL"
                                                >
                                                    <FaRegCopy size={20} />
                                                </button>
                                            </div>
                                            {isCopied && (
                                                <div className="copy2-notification">
                                                    URL copiada al portapapeles! 📋
                                                </div>
                                            )}
                                            <img
                                                src={imagenQr}
                                                alt="Código QR de pago"
                                                className="qr2-payment-image"
                                            />
                                        </div>
                                    </div>
                                    {/* Botón para cerrar la vista del QR */}
                                    <button
                                        onClick={handleCloseAndSubmit}
                                    >
                                        Cerrar
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                    <Footer />
                </div>
            </div>
        </div>
    );
};

export default TestFormQrBancolombia;