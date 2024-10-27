import React, { useState} from 'react';
import {Nav} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { FaDesktop, FaSync, FaFileAlt, FaChartBar, FaExclamationTriangle, FaProjectDiagram, FaClipboardList, FaBug, FaChartLine, FaUsers, FaClipboardCheck, FaFileContract, FaClipboard} from 'react-icons/fa';  // Agregar los íconos
import userImage from '../assets/user2.png';

function Sidebar() {
  const navigate = useNavigate();
  const [openSubmenu, setOpenSubmenu] = useState({});
  const username = localStorage.getItem('username');

  const toggleSubmenu = (key) => {
    setOpenSubmenu((prev) => ({
      ...prev,
      [key]: !prev[key], 
    }));
  };

  
  return (
    <div className="bg-light sidebar" style={{ height: '100vh', paddingTop: '20px' }}>
      <div className="text-center">
        <img 
          src={userImage} 
          alt="User" 
          style={{ width: '100px', borderRadius: '50%', marginBottom: '10px', cursor: 'pointer' }} 
          onClick={() => navigate('/dashboard')}
        />
        <h5>{username}</h5>
      </div>

       <Nav className="flex-column mt-4">
              {/* Gestión de Proyectos */}
              <Nav.Link onClick={() => toggleSubmenu('proyectos')} style={{ cursor: 'pointer' }}>
                <FaProjectDiagram className="me-2 "/> {/* Ícono para Gestión de Proyectos */}
                Gestión de proyectos ▼
              </Nav.Link>
              {openSubmenu.proyectos && (
                <Nav className="flex-column ms-3">
                  <Nav.Link href="/proyectos">
                    <FaProjectDiagram className="me-2" /> Proyectos
                  </Nav.Link>
                  <Nav.Link href="/recursos">
                    <FaDesktop className="me-2" /> Recursos
                  </Nav.Link>
                  <Nav.Link href="/colaboradores">
                    <FaUsers className="me-2" /> Colaboradores
                  </Nav.Link>
                  <Nav.Link href="/asignaciones">
                    <FaClipboardList className="me-2" /> Seguimiento de proyectos
                  </Nav.Link>
                </Nav>
              )}

              {/* Planificación de Pruebas */}
              <Nav.Link onClick={() => toggleSubmenu('pruebas')} style={{ cursor: 'pointer' }}>
                <FaClipboardCheck className="me-2" /> {/* Ícono para Planificación de Pruebas */}
                Gestión de Pruebas ▼
              </Nav.Link>
              {openSubmenu.pruebas && (
                <Nav className="flex-column ms-3">
                  <Nav.Link href="planpruebas">
                    <FaFileContract  className="me-2" /> Plan de prueba
                  </Nav.Link>
                  <Nav.Link href="casopruebas">
                    <FaClipboard  className="me-2" /> Casos de prueba
                  </Nav.Link>
                 
                </Nav>
              )}

<Nav.Link href="ejecucionprueba">
                <FaSync className="me-2" /> Ejecución de Pruebas
              </Nav.Link>
              
              {/* Gestion de Defectos */}
              <Nav.Link onClick={() => toggleSubmenu('defectos')} style={{ cursor: 'pointer' }}>
                <FaClipboardCheck className="me-2" /> {/* Ícono para Planificación de Defectos */}
                Gestión de Defectos▼
              </Nav.Link>
              {openSubmenu.defectos && (
                <Nav className="flex-column ms-3">
                  <Nav.Link href="defectos">
                  <FaBug className="me-2" />Defectos
                  </Nav.Link>
                  <Nav.Link href="seguimientodefectos">
                    <FaExclamationTriangle   className="me-2" /> Seguimiento de defectos
                  </Nav.Link>
                 
                </Nav>
              )}

              {/* Gestion de Metricas */}
              <Nav.Link onClick={() => toggleSubmenu('metricas')} style={{ cursor: 'pointer' }}>
                <FaChartLine className="me-2" /> {/* Ícono para Planificación de Defectos */}
                Métricas e Informes▼
              </Nav.Link>
              {openSubmenu.metricas && (
                <Nav className="flex-column ms-3">
                  <Nav.Link href="informes">
                <FaFileAlt  className="me-2" />Informes
                  </Nav.Link>

                  <Nav.Link href="metricas">
                <FaChartBar  className="me-2" />Métricas
                  </Nav.Link>
                </Nav>
                
              )}
              
              <Nav.Link href="usuarios">
                <FaUsers className="me-2" /> Usuarios
              </Nav.Link>
            </Nav>          
    </div> 
  );
  
}

export default Sidebar;
