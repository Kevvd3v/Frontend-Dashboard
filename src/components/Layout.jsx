import React, { useState } from "react";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom"; 
import { Menu } from "lucide-react"; // Ya no necesitamos importar X aquí

export default function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); 
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="app-layout"> 

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

      {/* 3. ÁREA DE CONTENIDO PRINCIPAL */}
      <main className="dashboard-main-wrapper">
        <div className="dashboard-main-content">
          <Outlet /> 
        </div>
        
        {/* Capa oscura (Overlay) */}
        <div 
            className={`overlay-backdrop ${isSidebarOpen ? 'open' : ''}`} 
            onClick={toggleSidebar}
        ></div>
      </main>
      
    </div>
  );
}