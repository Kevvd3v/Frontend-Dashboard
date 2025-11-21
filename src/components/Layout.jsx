import React, { useState } from "react";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom"; 
import { Menu } from "lucide-react";

export default function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); 
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="app-layout"> 

      {/* 1. BOTÓN HAMBURGUESA (Solo visible en móvil Y cuando sidebar está cerrado) */}
      {!isSidebarOpen && (
        <button 
          className="hamburger-menu-btn" 
          onClick={toggleSidebar}
          aria-label="Abrir menú"
        >
          <Menu size={24} />
        </button>
      )}
      
      {/* 2. SIDEBAR */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        toggleSidebar={toggleSidebar} 
      />

      {/* 3. OVERLAY (Fondo oscuro) - FUERA del main */}
      <div 
        className={`overlay-backdrop ${isSidebarOpen ? 'open' : ''}`} 
        onClick={toggleSidebar}
      ></div>

      {/* 4. ÁREA DE CONTENIDO PRINCIPAL */}
      <main className="dashboard-main-wrapper">
        <Outlet /> 
      </main>
      
    </div>
  );
}