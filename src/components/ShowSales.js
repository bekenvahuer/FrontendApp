import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './ShowSales.css'; // Asegúrate de importar el archivo CSS
import { FaPlus, FaEdit, FaTrash, FaFilter } from 'react-icons/fa';
import { API_BASE_URL } from "./config";
import { FRONTEND_URL } from "./config";

const endpoint = `${API_BASE_URL}`;

const ShowSales = () => {
  const [sales, setSales] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [employees, setEmployees] = useState([]);
  const [showFilters, setShowFilters] = useState(false); // Estado inicial de los filtros oculto


  useEffect(() => {
    getAllSales();
    getEmployees();
  }, []);

  const getAllSales = async () => {
    const response = await axios.get(`${endpoint}/sales`);
    setSales(response.data);
    setFilteredSales(response.data); // Initialize filtered sales
  };

  const getEmployees = async () => {
    const response = await axios.get(`${endpoint}/users`);
    const employeeList = response.data.filter(user => user.employee);
    setEmployees(employeeList);
  };

  const deleteSale = async (id) => {
    await axios.delete(`${endpoint}/sale/${id}`);
    getAllSales();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleFilter = () => {
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;

    const filtered = sales.filter(sale => {
      const description = JSON.parse(sale.description);
      const saleDate = new Date(description.updated_at);

      const saleDateString = formatDate(saleDate); // Convertir a 'YYYY-MM-DD' para comparar

      const matchesDate = (!start || saleDateString >= startDate) && (!end || saleDateString <= endDate);
      const matchesEmployee = employeeId === '' || description.employee.toLowerCase() === employeeId.toLowerCase();

      return matchesDate && matchesEmployee;
    });

    setFilteredSales(filtered);
  };
  

  return (
    <div>
      <h3>Show Sales</h3>
      <button
        className="btn btn-secondary mb-3"
        style={{ backgroundColor : '#a27014' }}
        onClick={() => setShowFilters(!showFilters)}
      >
        <FaFilter style={{ color: '#ffffff' }} />
        {showFilters ? ' Hide Filters' : ' Show Filters'}
      </button>
      {showFilters && (
      <div className="filter-container">
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
        <select
          value={employeeId}
          onChange={(e) => setEmployeeId(e.target.value)}
        >
          <option value="">Select an employee</option>
          {employees.map((employee) => (
            <option key={employee.id} value={employee.name}>
              {employee.name}
            </option>
          ))}
        </select>
        <button onClick={handleFilter}>Filter</button>
      </div>)}<br></br>
      <div className="table-container">
        <table className='table table-striped'>
          <thead className='bg-primary text-white'>
            <tr>
              <th>Title</th>
              <th>Employee</th>
              <th>Payroll Value</th>
              <th>Updated at</th>
              <th>Services Value</th>
            </tr>
          </thead>
          <tbody>
            {filteredSales.map((sale) => {
              const description = JSON.parse(sale.description);
              return (
                <tr key={sale.id}>
                  <td>{description.title}</td>
                  <td>{description.employee}</td>
                  <td>{description.payrollValue}</td>
                  <td>{formatDate(description.updated_at)}</td>
                  <td>{description.servicesValue}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ShowSales;
