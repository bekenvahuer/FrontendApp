import axios from 'axios'
import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from './Sidebar';
import Footer from './Footer';
import LogoUser from './LogoUser';
import './CSS/CreateService.css'; // Asegúrate de importar el archivo CSS
import { API_BASE_URL } from "./config";
import { FRONTEND_URL } from "./config";

const endpoint = `${API_BASE_URL}/service`
const productsEndpoint = `${API_BASE_URL}/products`

const CreateService = () => {
    const [name, setName] = useState('')
    const [description, setDescription] = useState('')
    const [price, setPrice] = useState(0)
    const [payrollValue, setPayrollValue] = useState(0)
    const [products, setProducts] = useState([])
    const [productGroups, setProductGroups] = useState([{ selectedProducts: [], productQuantity: 1 }])

    const navigate = useNavigate()
    const username = localStorage.getItem('idAdminKey') || 'usuario';

    useEffect(() => {
        const fetchProducts = async () => {
            const response = await axios.get(productsEndpoint)
            setProducts(response.data)
        }
        fetchProducts()
    }, [])

    const handleSelectChange = (e, index) => {
        const options = e.target.options
        const selectedOptions = []
        for (let i = 0; i < options.length; i++) {
            if (options[i].selected) {
                selectedOptions.push(options[i].value)
            }
        }
        const newProductGroups = [...productGroups]
        newProductGroups[index].selectedProducts = selectedOptions
        setProductGroups(newProductGroups)
    }

    const handleQuantityChange = (e, index) => {
        const newProductGroups = [...productGroups]
        newProductGroups[index].productQuantity = e.target.value
        setProductGroups(newProductGroups)
    }

    const addProductGroup = () => {
        setProductGroups([...productGroups, { selectedProducts: [], productQuantity: 1 }])
    }

    const store = async (e) => {
        e.preventDefault()
        const allDescription = {}
        productGroups.forEach(group => {
            group.selectedProducts.forEach(product => {
                allDescription[product] = group.productQuantity
            })
        })
        const serviceName = `${name}/${username}`;
        await axios.post(endpoint, {
            name: serviceName,
            description: description,
            price: price,
            payrollValue: payrollValue,
            allDescription: JSON.stringify(allDescription)
        })
        navigate(`/${username}/services`)
    }

    return (
        <div className='Container-calendarCreateService'>
            <Sidebar />
            <div className='Container-calendarCreateServices2'>
                <br></br>
                <h3 style={{ color: '#090027' }}>Crear Servicio</h3>
                <br></br>
                <LogoUser />
                <br></br>
                <form className="calendarCreateServices" onSubmit={store}>
                    <div className='mb-3'>
                        <label className='form-label' style={{ color: '#090027' }}>Nombre</label>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            type='text'
                            className='form-control'
                            required
                        />
                    </div>
                    <div className='mb-3'>
                        <label className='form-label' style={{ color: '#090027' }}>Descripcion</label>
                        <input
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            type='text'
                            className='form-control'
                            required
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
                    {productGroups.map((group, index) => (
                        <div key={index} className='mb-3' style={{ display: 'none' }}>
                            <div className='mb-3'>
                                <label className='form-label'>Services products</label>
                                <select multiple={true} className='form-control' onChange={(e) => handleSelectChange(e, index)}>
                                    {products.map((product) => (
                                        <option key={product.id} value={product.description}>
                                            {product.description}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className='mb-3'>
                                <label className='form-label'>Product Quantity</label>
                                <input
                                    value={group.productQuantity}
                                    onChange={(e) => handleQuantityChange(e, index)}
                                    type='number'
                                    className='form-control'
                                />
                            </div>
                        </div>
                    ))}
                    {/* <button type='button' className='btn btn-secondary' style={{ backgroundColor: '#a27014' }} onClick={addProductGroup}>Add</button><br></br><br></br> */}
                    <br></br><button type='submit' className="neumorphic-btn submit-btn" style={{ backgroundColor: '#c5b0f9', color: '#090027' }}
                        onClick={(e) => {
                            const confirmationMessage = `¿Estás seguro de que crear este servicio?`;

                            if (!window.confirm(confirmationMessage)) {
                                e.preventDefault(); // Solo evita el envío si el usuario cancela
                            }
                        }}>Crear</button><br></br>
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
    )
}

export default CreateService