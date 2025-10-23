import React, { useEffect, useState } from 'react';

const ResponseUrlePayco = ({ onProcessComplete }) => {
    const [transactionState, setTransactionState] = useState(null);
    const [transactionDate, setTransactionDate] = useState(null);
    const [refPayco, setRefPayco] = useState(null); // Nuevo estado para x_ref_payco
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Obtener el parámetro ref_payco de la URL
        const urlParams = new URLSearchParams(window.location.search);
        const refPayco = urlParams.get('ref_payco');

        if (refPayco) {
            

            // Hacer la solicitud a la API de ePayco
            fetch(`https://secure.epayco.co/validation/v1/reference/${refPayco}`)
                .then(response => response.json())
                .then(data => {
                    

                    if (data.success) {
                        // Extraer las variables requeridas
                        const { x_transaction_state, x_fecha_transaccion, x_ref_payco } = data.data;

                        // Actualizar el estado con los valores obtenidos
                        setTransactionState(x_transaction_state);
                        setTransactionDate(x_fecha_transaccion);
                        setRefPayco(x_ref_payco); // Actualizar el estado de x_ref_payco

                        // Llamar a la función onProcessComplete para retornar los valores
                        onProcessComplete({
                            transactionState: x_transaction_state,
                            transactionDate: x_fecha_transaccion,
                            refPayco: x_ref_payco, // Enviar x_ref_payco
                        });
                    } else {
                        console.error("Error al obtener los detalles de la transacción:", data);
                        setError("Hubo un error al obtener los detalles de la transacción.");
                    }
                })
                .catch(error => {
                    console.error("Error en la solicitud a la API de ePayco:", error);
                    setError("Hubo un error al conectar con el servidor.");
                })
                .finally(() => {
                    setLoading(false); // Finalizar el estado de carga
                });
        } else {
            console.error("No se encontró el parámetro ref_payco en la URL.");
            setError("No se encontró la referencia de pago.");
            setLoading(false);
        }
    }, [onProcessComplete]);

    if (loading) {
        return (
            <div>
                <h1>Procesando pago...</h1>
                <p>Por favor, espera mientras verificamos los detalles de tu transacción.</p>
            </div>
        );
    }

    if (error) {
        return (
            <div>
                <h1>Error</h1>
                <p>{error}</p>
            </div>
        );
    }

    return (
        <div>
            <h1>Transacción procesada</h1>
            <p>Estado de la transacción: {transactionState}</p>
            <p>Fecha de la transacción: {transactionDate}</p>
            <p>Referencia de pago: {refPayco}</p>
        </div>
    );
};

export default ResponseUrlePayco;