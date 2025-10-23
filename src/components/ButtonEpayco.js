import React, { useEffect } from 'react';
import './CSS/Carrucel.css';

const ButtonEpayco = ({
  amount,
  name,
  description,
  responseUrl,
  confirmationUrl,
  currency = 'COP',
  country = 'CO',
  testMode = true,
  external = false,
  buttonImage = 'https://multimedia.epayco.co/adquirencia-movil/botones/boton-azul-lineal-144_38.png',
}) => {
  useEffect(() => {
    // Crear un elemento script
    const script = document.createElement('script');
    script.src = 'https://checkout.epayco.co/checkout.js';
    script.setAttribute('data-epayco-key', 'a702b2f4ec312dbf0aadd8e551b29238'); // Llave pública de ePayco
    script.setAttribute('class', 'epayco-button');
    script.setAttribute('data-epayco-amount', amount); // Monto dinámico
    script.setAttribute('data-epayco-tax', '0');
    script.setAttribute('data-epayco-tax-ico', '0');
    script.setAttribute('data-epayco-tax-base', '0');
    script.setAttribute('data-epayco-name', name); // Nombre dinámico
    // script.setAttribute('data-epayco-description', description); // Descripción dinámica
    script.setAttribute('data-epayco-currency', currency); // Moneda dinámica
    script.setAttribute('data-epayco-country', country); // País dinámico
    script.setAttribute('data-epayco-test', ''); // Modo de prueba dinámico
    script.setAttribute('data-epayco-external', ''); // External dinámico. al dejarlo en blanco o en false se abre en el mismo modal.
    script.setAttribute('data-epayco-response', responseUrl); // URL de respuesta dinámica
    script.setAttribute('data-epayco-confirmation', confirmationUrl); // URL de confirmación dinámica
    script.setAttribute('data-epayco-button', buttonImage); // Imagen del botón dinámica

    // Añadir el script al formulario
    const form = document.querySelector('.container-carrucel2 form');
    if (form) {
      form.appendChild(script);
    }

    // Limpiar el script cuando el componente se desmonte.
    return () => {
      if (form && script) {
        form.removeChild(script);
      }
    };
  }, [amount, name, description, responseUrl, confirmationUrl, currency, country, testMode, external, buttonImage]);

  return (
    <div className="container-carrucel2">
      <form>
        {/* El botón se generará dinámicamente aquí */}
      </form>
    </div>
  );
};

export default ButtonEpayco;