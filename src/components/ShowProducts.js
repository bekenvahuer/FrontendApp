import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import { FaPlus, FaEdit, FaTrash, FaSync  } from 'react-icons/fa';
import './ShowSales.css'; // Asegúrate de importar el archivo CSS
import { API_BASE_URL } from "./config";
import { FRONTEND_URL } from "./config";

const endpoint = `${API_BASE_URL}`

const ShowProducts = () => {
  const [products, setProducts] = useState([])
  useEffect(() => {
    getAllProducts()
  }, [])

  const getAllProducts = async () => {
    const response = await axios.get(`${endpoint}/products`)
    setProducts(response.data)
  }
  const deleteProduct = async (id) => {
    await axios.delete(`${endpoint}/product/${id}`)
    getAllProducts()

  }

  return (
    <div>
      <h2>Show Products</h2>
      <div className='d-grid gap-2'>
        <Link to="/create" className='btn btn-success btn-lg mt-2 mb-2 ' style={{ backgroundColor: 'transparent', color: '#a27014', border: 'none' }}>
          <FaPlus style={{ color: '#a27014' }} /> Create
        </Link>
      </div>


      <div className="table-container">
        <table className='table table-striped'>
          <thead className='bg-primary text-white'>
            <tr>
              <th>Description</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Action</th>
            </tr>

          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product.id}>
                <td>{product.description}</td>
                <td>{product.price}</td>
                <td>{product.stock}</td>
                <td>
                  <div className="action-buttons">
                    <Link to={`/edit/${product.id}`} className='btn btn-warning me-2' style={{ backgroundColor: '#cbcbcb', borderColor: '#cbcbcb', color: '#898989' }}>
                      <FaEdit />
                    </Link>
                    <button
                      onClick={() => deleteProduct(product.id)}
                      className='btn btn-danger' style={{ backgroundColor: '#898989', borderColor: '#898989', color: '#cbcbcb' }}

                    >
                      <FaTrash />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default ShowProducts
