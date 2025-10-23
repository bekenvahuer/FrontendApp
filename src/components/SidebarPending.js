import './CSS/Sidebar.css';
import ClickCita from './ClickCita.png';
import logOut from './logOut.PNG';
import Services from './Services.png';
import Users from './Users.png';

const SidebarPending = () => {
  // Datos estáticos para demostración visual
  const username = "demoUser"; // Valor fijo para mostrar en la UI

  return (
    <ul className="sidebar-menu">
      {/* Logo ClickCita - Solo visual */}
      <li className="sidebar-item">
        <img
          src={ClickCita}
          alt="ClickCita"
          className="sidebar-icon2"
          style={{ cursor: 'default' }}
        />
      </li>

      {/* Ícono de Servicios - Solo visual */}
      <li className="sidebar-item">
        <img
          src={Services}
          alt="Services"
          className="sidebar-icon4"
          style={{ cursor: 'default' }}
        />
      </li>

      {/* Ícono de Usuarios - Solo visual */}
      <li className="sidebar-item">
        <img
          src={Users}
          alt="Users"
          className="sidebar-icon4"
          style={{ cursor: 'default' }}
        />
      </li>

      {/* Ícono de Cerrar Sesión - Solo visual */}
      <li className="sidebar-item">
        <img
          src={logOut}
          alt="logOut"
          className="sidebar-icon3"
          style={{ cursor: 'default' }}
        />
      </li>
    </ul>
  );
}

export default SidebarPending;