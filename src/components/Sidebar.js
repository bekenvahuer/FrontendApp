import { Link, useLocation } from 'react-router-dom';
import './CSS/Sidebar.css';
import imagenQr2 from './qr9.png';
import ClickCita from './ClickCita.png';
import logOut from './logOut.PNG';
import Services from './Services.png';
import Users from './Users.png';

const Sidebar = ({ toggleQRView, setCalendarView }) => {
  const location = useLocation();
  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    window.location.href = '/login'; // Redirigir al login
  };
  const username = localStorage.getItem('idAdminKey');
  

  return (

    <ul className="sidebar-menu">
      {/* <li className="sidebar-item" style={{ cursor: 'pointer' }}>
        <img src={ClickCita} alt="ClickCita" className="sidebar-icon2" />
      </li> */}
      <li
        className="sidebar-item"
        style={{ cursor: 'pointer' }}
        onClick={() => {
          if (location.pathname === `/${username}/calendar`) {
            setCalendarView('month');
          }
        }}
      >
        <Link to={`/${username}/calendar`}>
          <img src={ClickCita} alt="ClickCita" className="sidebar-icon2" />
        </Link>
      </li>

      {/* <li className="sidebar-item"><Link to="/events/create">Schedule</Link></li> */}
      {/* Comentado para futuras versiones: Link al calendario para gestionar eventos programados */}

      {/* <li className="sidebar-item"><Link to="/products">Products</Link></li> */}
      {/* Comentado para futuras versiones: Link a la página de productos */}

      <li className="sidebar-item"><Link to={`/${username}/services`}><img src={Services} alt="Services" className="sidebar-icon4" /></Link></li>

      {/* <li className="sidebar-item"><Link to="/payrolls">Payroll</Link></li> */}
      {/* Comentado para futuras versiones: Link al sistema de nómina para gestionar pagos */}

      <li className="sidebar-item"><Link to={`/${username}/users`}><img src={Users} alt="Users" className="sidebar-icon4" /></Link></li>

      {/* <li className="sidebar-item"onClick={handleLogout}>Cerrar Sesión</li> */}

      {/* <li className="sidebar-item"><Link to="/sales">Sales</Link></li> */}
      {/* Comentado para futuras versiones: Link a la página de gestión de ventas */}

      {/* Mostrar solo en la vista Home */}
      {location.pathname === `/${username}/calendar` && (
        <li className="sidebar-item" onClick={toggleQRView} style={{ cursor: 'pointer' }}>
          <img src={imagenQr2} alt="QR Code" className="sidebar-icon" />
        </li>
      )}
      <li className="sidebar-item"
        onClick={() => {
          if (window.confirm("¿Estás seguro de que deseas cerrar sesión?")) {
            handleLogout();
          }
        }}
        style={{ cursor: 'pointer' }}>
        <img src={logOut} alt="logOut" className="sidebar-icon3" />
      </li>
    </ul>

  );
}

export default Sidebar;
