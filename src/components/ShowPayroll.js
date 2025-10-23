import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './ShowSales.css'; // Asegúrate de importar el archivo CSS
import { Link } from 'react-router-dom';
import { FaPlus, FaEdit, FaTrash, FaFilter } from 'react-icons/fa';
import { API_BASE_URL } from "./config";
import { FRONTEND_URL } from "./config";

const endpoint = `${API_BASE_URL}`;

const ShowPayrolls = () => {
  const [payrolls, setPayrolls] = useState([]);
  const [filteredPayrolls, setFilteredPayrolls] = useState([]);
  const [selectedPayrolls, setSelectedPayrolls] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [doneStatus, setDoneStatus] = useState('');
  const [employees, setEmployees] = useState([]);
  const [sales, setSales] = useState([]);
  const [showFilters, setShowFilters] = useState(false); // Estado inicial de los filtros oculto

  useEffect(() => {
    getAllPayrolls();
    getEmployees();
    getSales();
  }, []);

  const getAllPayrolls = async () => {
    const response = await axios.get(`${endpoint}/payrolls`);
    setPayrolls(response.data);
    setFilteredPayrolls(response.data); // Initialize filtered payrolls
  };

  const getEmployees = async () => {
    const response = await axios.get(`${endpoint}/users`);
    const employeeList = response.data.filter(user => user.employee);
    setEmployees(employeeList);
  };

  const getSales = async () => {
    const response = await axios.get(`${endpoint}/sales`);
    setSales(response.data);
  };

  const handleCheckboxChange = (id) => {
    setSelectedPayrolls((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((payrollId) => payrollId !== id)
        : [...prevSelected, id]
    );
  };

  const updateDoneStatus = async () => {
    await axios.put(`${endpoint}/payrolls/done`, { ids: selectedPayrolls });
    getAllPayrolls();
    setSelectedPayrolls([]);
  };

  const handleFilter = () => {
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
  
    const filtered = payrolls.filter(payroll => {
      const payrollDate = new Date(payroll.payday); // Cambiar a payroll.payday si es la fecha correcta
  
      // Check if the payroll date matches the date filter criteria
      const matchesDate = (!start || payrollDate >= start) && (!end || payrollDate <= end);
  
      // Check if the employee matches the employee filter criteria
      const matchesEmployee = employeeId === '' || (payroll.employee && payroll.employee.toLowerCase() === employeeId.toLowerCase());
  
      // Check if the done status matches the done status filter criteria
      const matchesDone = doneStatus === '' || (doneStatus === 'true' ? payroll.done : !payroll.done);
  
      // Return true if all criteria are met
      return matchesDate && matchesEmployee && matchesDone;
    });
  
    // Update the filtered payrolls state
    setFilteredPayrolls(filtered);
  };
  
  

  const getEmployeeName = (payroll) => {
    const sale = sales.find(s => JSON.parse(s.description).id === payroll.id);
    return sale ? JSON.parse(sale.description).employee : 'Unknown';
  };

  return (
    <div>
      <h2>Show Payrolls</h2>
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
          name="startDate" 
          value={startDate} 
          onChange={(e) => setStartDate(e.target.value)} 
        />
        <input 
          type="date" 
          name="endDate" 
          value={endDate} 
          onChange={(e) => setEndDate(e.target.value)} 
        />
        <select 
          name="employee" 
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
        <select name="doneStatus" value={doneStatus} onChange={(e) => setDoneStatus(e.target.value)}>
          <option value="">All</option>
          <option value="true">Yes</option>
          <option value="false">No</option>
        </select>
        <button onClick={handleFilter}>Filter</button>
      </div>)}<br></br> 
      <div className="table-container">
      <table className='table table-striped'>
        <thead className='bg-primary text-white'>
          <tr>
            <th></th>
            <th>Title</th>
            <th>Employee</th>
            <th>PayrollValue</th>
            <th>Done</th>
            <th>PayDay</th>
          </tr>
        </thead>
        <tbody>
          {filteredPayrolls.map((payroll) => (
            <tr key={payroll.id}>
              <td>
                {!payroll.done && (
                  <input
                    type="checkbox"
                    checked={selectedPayrolls.includes(payroll.id)}
                    onChange={() => handleCheckboxChange(payroll.id)}
                  />
                )}
              </td>
              <td>{payroll.title}</td>
              <td>{payroll.employee}</td>
              <td>{payroll.payrollValue}</td>
              <td>{payroll.done ? 'Yes' : 'No'}</td>
              <td>{payroll.payday}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={updateDoneStatus}>Update Done Status</button>
    </div>
    </div>
  );
}

export default ShowPayrolls;
