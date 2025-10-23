import React from "react";
import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar";
import Footer from "./Footer";

const CustomPage = () => {
  const location = useLocation();

  return (
    <div className="Container-CustomPage">
      <Sidebar />

      <div className="content">
        {location.pathname === "/unirse2" && (
          <>
            <h2>Página Unirse2</h2>
            <p>Este contenido antes estaba en clickcita.online/#unirse2</p>
          </>
        )}

        {location.pathname === "/test" && (
          <>
            <h2>Página Test</h2>
            <p>Este contenido antes estaba en clickcita.online/#test</p>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default CustomPage;
