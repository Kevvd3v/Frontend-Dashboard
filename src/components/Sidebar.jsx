import React from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, BarChart3, Globe, X } from "lucide-react"; 

export default function Sidebar({ isOpen, toggleSidebar }) {
  
  // Estilos para el estado activo/inactivo de los enlaces
  const activeStyle = {
    background: "linear-gradient(135deg, #5cc4e7ff 0%, #3096d6ff 100%)",
    color: "white",
    boxShadow: "0 4px 15px rgba(79, 70, 229, 0.4)" 
  };

  const inactiveStyle = {
    color: "#94A3B8", 
    background: "transparent",
  };

  return (
    // La clase 'open' controla la visibilidad en móvil gracias al CSS
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}> 
      
      {/* Botón de cierre interno (Solo visible en móvil) */}
      <button 
        className="sidebar-close-btn" 
        onClick={toggleSidebar} 
        aria-label="Cerrar menú"
      >
          <X size={24} />
      </button>

      {/* LOGO */}
      <div className="sidebar-header">
        <div className="sidebar-logo-icon-wrapper">
            <Globe color="white" size={20} />
        </div>
        <h1 className="sidebar-logo-text-title">
          Happy World
        </h1>
      </div>

      {/* MENÚ DE NAVEGACIÓN */}
      <nav className="sidebar-nav">
        
        {/* Botón Resumen */}
        <NavLink 
          to="/" 
          // Cierra el menú automáticamente al hacer click en un enlace (Mejora UX móvil)
          onClick={isOpen ? toggleSidebar : undefined} 
          style={({ isActive }) => ({
            textDecoration: "none",
            display: "flex", alignItems: "center", gap: "12px",
            padding: "12px 16px", borderRadius: "12px",
            fontSize: "0.95rem", fontWeight: "500",
            transition: "all 0.3s ease",
            ...(isActive ? activeStyle : inactiveStyle)
          })}
        >
          <LayoutDashboard size={20} />
          <span>Resumen</span>
        </NavLink>

        {/* Botón Gráficas */}
        <NavLink 
          to="/graficas" 
          onClick={isOpen ? toggleSidebar : undefined} 
          style={({ isActive }) => ({
            textDecoration: "none",
            display: "flex", alignItems: "center", gap: "12px",
            padding: "12px 16px", borderRadius: "12px",
            fontSize: "0.95rem", fontWeight: "500",
            transition: "all 0.3s ease",
            ...(isActive ? activeStyle : inactiveStyle)
          })}
        >
          <BarChart3 size={20} />
          <span>Gráficas</span>
        </NavLink>

      </nav>

      {/* Footer del Sidebar */}
      <div className="sidebar-footer">
        <p className="sidebar-footer-text">
          © 2025 Dashboard Project
        </p>
      </div>

    </aside>
  );
}