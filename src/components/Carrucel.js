import React from 'react';
import './CSS/Carrucel.css';
import imagen2 from './imagen2.webp';
import imagenEstatica from './imagenEstatica.PNG'; // Imagen estática

const Carrucel = () => {
    return (
        <div className="container-carrucel">
            <div className="imagen-estatica">
                <img src={imagenEstatica} alt="Imagen Estática" />
                <div className="texto-estatico">
                    <p>Descubre Clickcita, la aplicación ideal para encontrar servicios de spa, peluquerías, uñas y barberías.</p>
                    <p>¡Haz tu cita hoy y transforma tu experiencia de cuidado personal!</p>
                    <p></p>
                </div>
            </div>

            <div className="carrusel">
                <div className="carrusel-slides">
                    <div className="slide">
                        <img src={imagen2} alt="Imagen 2" />
                    </div>
                    <div className="slide">
                        <img src={imagen2} alt="Imagen 2" />
                    </div>
                    <div className="slide">
                        <img src={imagen2} alt="Imagen 3" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Carrucel;