import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./CSS/Login2.css";
import Footer from "./Footer";
import imagenLogin1 from "./login-image1.png";
import imagenLogin2 from "./login-image2.png";
import imagenLogin3 from "./login-image3.png";
import imagenLogin4 from "./login-image4.png";
import imagenLogin5 from "./login-image5.png";

const TestFormFree = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const planDePago = location.state?.planDePago || "Free"; // Valor por defecto

    // Estado para manejar los valores del formulario
    const [formData, setFormData] = useState({
        rol: "Admin", // Rol fijo para nuevos usuarios
        skills: "",
        comprobanteDePago: "",
        planDePago: planDePago,
        IdAdmin: "",
        nombreNegocio: "",
        whatsapp: "",
        direccionNegocio: "",
        ciudad: "",
        pais: ""
    });

    const [showModal, setShowModal] = useState(false);
    const [error, setError] = useState(null);
    const [currentImage, setCurrentImage] = useState(0);

    // Imágenes para el carrusel
    const images = [imagenLogin1, imagenLogin2, imagenLogin3, imagenLogin4, imagenLogin5];

    // Generar IdAdmin basado en las reglas establecidas
    const generateIdAdmin = (nombreNegocio, whatsapp) => {
        const cleanName = nombreNegocio.replace(/[^a-zA-Z0-9]/g, "");
        const trimmedName = cleanName.slice(0, 15);
        const lastFourDigits = whatsapp.slice(-4);
        return `@${trimmedName}${lastFourDigits}`; // Asegura que comience con "@"
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
        
        setFormData(prevState => ({
            ...prevState,
            IdAdmin: generatedIdAdmin
        }));
    }, [formData.nombreNegocio, formData.whatsapp]);

    // Manejar cambios en los inputs
    const handleInputChange = (e) => {
        const { name, value } = e.target;

        // Validación específica para el campo "whatsapp"
        if (name === "whatsapp") {
            if (/^\d{0,10}$/.test(value)) { // Solo permite números y máximo 10 dígitos
                setFormData({
                    ...formData,
                    [name]: value,
                });
                setError(null); // Limpia el mensaje de error si el valor es válido
            } else {
                setError("El teléfono solo debe contener números y tener máximo 10 dígitos.");
            }
        }
        // Validación específica para el campo "direccionNegocio"
        else if (name === "direccionNegocio") {
            const cleanedValue = value.replace(/[^a-zA-Z0-9\s]/g, ""); // Elimina caracteres especiales
            setFormData({
                ...formData,
                [name]: cleanedValue, // Almacena el valor limpio
            });
        }
        else {
            // Para los demás campos, actualiza el estado sin validación
            setFormData({
                ...formData,
                [name]: value,
            });
        }
    };

    // Mostrar el modal antes de enviar
    const handleShowModal = (e) => {
        e.preventDefault(); // Evita que el formulario se envíe automáticamente

        // Verifica si hay un error en el campo "whatsapp"
        if (error) {
            alert("Por favor, corrige el campo de WhatsApp antes de continuar.");
            return;
        }

        setShowModal(true);
    };

    // Manejar el envío del formulario
    const handleSubmit = () => {
        setShowModal(false);
        const generatedIdAdmin = generateIdAdmin(formData.nombreNegocio, formData.whatsapp);
        const dataToSend = {
            IdAdmin: {
                [generatedIdAdmin]: {
                    ...formData,
                    IdAdmin: generatedIdAdmin, // Asegura que el IdAdmin esté incluido
                },
            },
        };
        navigate("/login", { state: { postData: dataToSend } }); // Redirige a Login con los datos
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
                                alignItems: 'center'
                            }}>
                                <div style={{
                                    backgroundColor: 'white',
                                    color: 'black',
                                    padding: '20px',
                                    borderRadius: '8px',
                                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)'
                                }}>
                                    <h4>¿Estás de acuerdo con esta información?</h4>
                                    <p><strong>Nombre del Negocio:</strong> {formData.nombreNegocio}</p>
                                    <p><strong>Whatsapp:</strong> {formData.whatsapp}</p>
                                    <p><strong>Dirección del Negocio:</strong> {formData.direccionNegocio}</p>
                                    <p><strong>Ciudad:</strong> {formData.ciudad}</p>
                                    <p><strong>Plan de Pago:</strong> {formData.planDePago}</p>
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
                                    <button onClick={handleSubmit}>Enviar</button>
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

export default TestFormFree;