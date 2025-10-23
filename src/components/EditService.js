import axios from "axios";
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from './Sidebar';
import Footer from './Footer';
import LogoUser from './LogoUser';
import './CSS/EditService.css'; // Asegúrate de importar el archivo CSS
import { API_BASE_URL } from "./config";
import { FRONTEND_URL } from "./config";

const serviceEndpoint = `${API_BASE_URL}/service/`;
const productsEndpoint = `${API_BASE_URL}/products/`;
const username = localStorage.getItem('idAdminKey');

const EditService = () => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState(0);
    const [payrollValue, setPayrollValue] = useState(0);
    const [allDescription, setAllDescription] = useState([]);
    const [products, setProducts] = useState([]);
    const navigate = useNavigate();
    const { id } = useParams();

    useEffect(() => {
        const getServiceById = async () => {
            try {
                const response = await axios.get(`${serviceEndpoint}${id}`);
                setName(response.data.name); // Guardar el nombre completo (incluyendo /${username})
                setDescription(response.data.description);
                setPrice(response.data.price);
                setPayrollValue(response.data.payrollValue);

                const parsedAllDescription = JSON.parse(response.data.allDescription);
                const formattedAllDescription = Object.keys(parsedAllDescription).map(key => ({
                    description: key,
                    value: parsedAllDescription[key]
                }));
                setAllDescription(formattedAllDescription);
            } catch (error) {
                console.error("Error al obtener servicio:", error);
            }
        };

        const getProducts = async () => {
            try {
                const response = await axios.get(productsEndpoint);
                setProducts(response.data);
            } catch (error) {
                console.error("Error al obtener productos:", error);
            }
        };

        getServiceById();
        getProducts();
    }, [id]);

    const update = async (e) => {
        e.preventDefault();

        // Formatear el nombre con el username antes de enviarlo
        const formattedName = `${name.split('/')[0]}/${username}`;

        const allDescriptionObject = {};
        allDescription.forEach(item => {
            if (item.value !== 0) {
                allDescriptionObject[item.description] = item.value;
            }
        });

        await axios.put(`${serviceEndpoint}${id}`, {
            name: formattedName, // Enviar el nombre formateado
            description: description,
            price: price,
            payrollValue: payrollValue,
            allDescription: JSON.stringify(allDescriptionObject)
        });

        navigate(`/${username}/services`);
    };

    const handleValueChange = (e, index) => {
        const newAllDescription = [...allDescription];
        newAllDescription[index].value = e.target.value;
        if (e.target.value === "0") {
            newAllDescription.splice(index, 1);
        }
        setAllDescription(newAllDescription);
    };

    const handleProductChange = (e, index) => {
        const newAllDescription = [...allDescription];
        newAllDescription[index].description = e.target.value;
        setAllDescription(newAllDescription);
    };

    const addProductGroup = () => {
        setAllDescription([...allDescription, { description: '', value: 1 }]);
    };

    return (
        <div className='Container-calendarEditService'>
            <Sidebar />
            <div className='Container-calendarEditServices2'>
                <br></br>
                <h3 style={{ color: '#090027' }}>Editar Servicio</h3>
                <br></br>
                <LogoUser />
                <br></br>
                <form className="calendarEditServices" onSubmit={update}>
                    <div className='mb-3'>
                        <label className='form-label' style={{ color: '#090027' }}>Nombre</label>
                        <input
                            value={name.split('/')[0]} // Mostrar solo la parte antes de la '/'
                            onChange={(e) => setName(e.target.value)} // Guardar el valor sin formato
                            type='text'
                            className='form-control'
                        />
                    </div>
                    <div className='mb-3'>
                        <label className='form-label' style={{ color: '#090027' }}>Descripcion</label>
                        <input
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            type='text'
                            className='form-control'
                        />
                    </div>
                    <div className='mb-3'>
                        <label className='form-label' style={{ color: '#090027' }}>Valor</label>
                        <input
                            value={price}
                            onChange={(e) => {
                                const value = e.target.value.replace(/[^0-9]/g, ''); // Solo permite números
                                setPrice(value);
                            }}
                            type='text' // Cambiar a tipo 'text'
                            className='form-control'
                        />
                    </div>
                    <div className='mb-3'>
                        <label className='form-label' style={{ color: '#090027' }}>Valor Nomina</label>
                        <input
                            value={payrollValue}
                            onChange={(e) => {
                                const value = e.target.value.replace(/[^0-9]/g, ''); // Solo permite números
                                setPayrollValue(value);
                            }}
                            type='text' // Cambiar a tipo 'text'
                            className='form-control'
                        />
                    </div>
                    {allDescription.map((item, index) => (
                        <div key={index} className='mb-3' style={{ display: 'none' }}>
                            <label className='form-label'>Service Product Description</label>
                            {item.description ? (
                                <input
                                    value={item.description}
                                    readOnly
                                    type='text'
                                    className='form-control'
                                />
                            ) : (
                                <select
                                    value={item.description}
                                    onChange={(e) => handleProductChange(e, index)}
                                    className='form-control'
                                >
                                    <option value='' disabled>Select a product</option>
                                    {products.map(product => (
                                        <option key={product.id} value={product.description}>
                                            {product.description}
                                        </option>
                                    ))}
                                </select>
                            )}
                            <label className='form-label'>Product Quantity</label>
                            <input
                                value={item.value}
                                onChange={(e) => handleValueChange(e, index)}
                                type='number'
                                className='form-control'
                            />
                        </div>
                    ))}
                    <br></br><button type='submit' className="neumorphic-btn submit-btn" style={{ backgroundColor: '#c5b0f9', color: '#090027' }}
                        onClick={(e) => {
                            const confirmationMessage = `¿Estás seguro de que deseas Editar el servicio?`;

                            if (!window.confirm(confirmationMessage)) {
                                e.preventDefault(); // Solo evita el envío si el usuario cancela
                            }
                        }}>Editar</button><br></br>
                    <button
                        type="button"
                        className="neumorphic-btn cancel-btn"
                        style={{ backgroundColor: "#4e54e7", color: "#eddeff" }}
                        onClick={() => navigate(`/${username}/calendar`)}
                    >
                        Cancelar
                    </button><br></br><br></br>
                </form>
            </div>

            <Footer />
        </div>
    );
};

export default EditService;