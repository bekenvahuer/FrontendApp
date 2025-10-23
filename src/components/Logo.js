import React from 'react';
import './CSS/Logo.css';
import imagenEstatica from './imagenEstatica.PNG'; // Imagen estática

const Logo = () => {
  return (
    <div className="container-logo">
      <div className="imagen-estaticaLogo">
        <img src={imagenEstatica} alt="Imagen Estática" />
      </div>
    </div>
  );
};

export default Logo;
