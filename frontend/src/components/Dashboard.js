import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Nav, Card } from 'react-bootstrap';
import { Outlet, useNavigate } from 'react-router-dom';
import { FaSignOutAlt, FaFileAlt, FaChartBar , FaSync, FaExclamationTriangle , FaBars, FaDesktop, FaProjectDiagram, FaClipboardList, FaBug, FaChartLine, FaUsers, FaClipboardCheck, FaFileContract, FaClipboard} from 'react-icons/fa';  // Agregar los íconos
import { Bar, Pie } from 'react-chartjs-2';
import 'chart.js/auto'; // Importa Chart.js automáticamente
import userImage from '../assets/user2.png';
import '../Dashboard.css';

function Dashboard() {
  const navigate = useNavigate();
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);  // Estado para controlar la visibilidad del menú lateral
  const [openSubmenu, setOpenSubmenu] = useState({}); // Para controlar qué submenús están abiertos
  const username = localStorage.getItem('username');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/login');  // Redirige al login después de cerrar sesión
  };

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);  // Cambiar el estado para ocultar o mostrar el menú
  };

  const toggleSubmenu = (key) => {
    setOpenSubmenu((prev) => ({
      ...prev,
      [key]: !prev[key], // Alternar la visibilidad del submenú
    }));
  };

  const goToDashboard = () => {
    navigate('/dashboard');
  };


  const [pruebasPorPeriodo] = useState({
    dia: [12, 18, 22, 30],
    mes: [200, 220, 180, 250],
    anio: [1500, 1700, 1600, 1800]
  });

  const [totalRecursos, setTotalRecursos] = useState(0); // Nuevo estado para total de recursos
  const [totalProyectosActivos, setTotalProyectosActivos] = useState(0); // Nuevo estado para total de proyectos activos
  const [TotalEjecucionPruebas, setTotalTotalEjecucionPruebas] = useState(0); 
  const [TotalDefectosEncontrados, setTotalTotalDefectosEncontrados] = useState(0); 

  useEffect(() => {
    // Obtener el total de recursos desde la API
    fetch('http://localhost:5000/recursos/count')
      .then((response) => response.json())
      .then((data) => {
        setTotalRecursos(data.total); // Actualiza el total de recursos
      })
      .catch((error) => {
        console.error('Error al obtener el total de recursos:', error);
      });

    // Obtener el total de proyectos activos desde la API
    fetch('http://localhost:5000/proyectos/count/activos')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        setTotalProyectosActivos(data.total); // Actualiza el total de proyectos activos
      })
      .catch((error) => {
        console.error('Error al obtener el total de proyectos activos:', error);
      });

    // Obtener el total de pruebas ejecutadas
    fetch('http://localhost:5000/ejecucionPruebas/count')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        setTotalTotalEjecucionPruebas(data.total);
      })
      .catch((error) => {
        console.error('Error al obtener el total de pruebas ejecutadas:', error);
      });
      
      fetch('http://localhost:5000/defectos/count')
      .then((response) => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then((data) => {
        setTotalTotalDefectosEncontrados(data.total);
      })
      .catch((error) => {
        console.error('Error al obtener el total de defectos encontrados:', error);
      });  


  }, []);

  const barData = {
    labels: ['Día', 'Mes', 'Año'],
    datasets: [
      {
        label: 'Pruebas realizadas',
        data: [pruebasPorPeriodo.dia.reduce((a, b) => a + b, 0),
               pruebasPorPeriodo.mes.reduce((a, b) => a + b, 0),
               pruebasPorPeriodo.anio.reduce((a, b) => a + b, 0)],
        backgroundColor: 'green',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }
    ]
  };

  const pieData = {
    labels: ['Día', 'Mes', 'Año'],
    datasets: [
      {
        label: 'Pruebas',
        data: [pruebasPorPeriodo.dia.reduce((a, b) => a + b, 0),
               pruebasPorPeriodo.mes.reduce((a, b) => a + b, 0),
               pruebasPorPeriodo.anio.reduce((a, b) => a + b, 0)],
        backgroundColor: ['#f14d00', '#097e9b', '#1a6441'],
        hoverOffset: 4
      }
    ]
  };

  return (
    <Container fluid>
      <Row>
        {/* Menú lateral izquierdo */}
        {isSidebarVisible && (
          <Col xs={2} className={`bg-light sidebar ${!isSidebarVisible ? 'collapsed' : ''}`} style={{ height: '100vh', paddingTop: '20px' }}>
            <div className="text-center">
              <img 
                src={userImage} 
                alt="User" 
                style={{ width: '100px', borderRadius: '50%', marginBottom: '10px', cursor: 'pointer' }} 
                onClick={goToDashboard}  // Redirigir al hacer clic
              />
              <h5>{username}</h5>  {/* Muestra el nombre de usuario */}
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
            
          </Col>
        )}

        

        {/* Contenido del dashboard */}
        <Col xs={isSidebarVisible ? 10 : 12} className="p-4">
          <div className="d-flex justify-content-between align-items-center">
            {/* Ícono para ocultar/expandir el menú lateral */}
            <FaBars  
              size={24}
              onClick={toggleSidebar}
              style={{ cursor: 'pointer', color: 'whitesmoke' }}
              title={isSidebarVisible ? 'Ocultar menú' : 'Mostrar menú'}
            />
            <h1>Dashboard - TestMaster</h1>
            <FaSignOutAlt
              size={24}
              onClick={handleLogout}
              style={{ cursor: 'pointer', color: 'whitesmoke' }}
              title="Cerrar sesión"
            />
          </div>
          <br></br>
          <Row className="mb-4">
            <Col md={3}>
              <Card className="text-center resumen-card">
                <Card.Body>
                  <FaClipboardList size={40} className="mb-2 icono-resumen"/>
                  <h5>Pruebas Ejecutadas</h5>
                  <h3>{TotalEjecucionPruebas}</h3>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center resumen-card">
                <Card.Body>
                  <FaProjectDiagram size={40} className="mb-2 icono-resumen"/>
                  <h5>Proyectos Activos</h5>
                  <h3>{totalProyectosActivos}</h3> {/* Muestra el total de proyectos activos */}
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center resumen-card">
                <Card.Body>
                  <FaUsers size={40} className="mb-2 icono-resumen" />
                  <h5>Recursos</h5>
                  <h3>{totalRecursos}</h3> {/* Muestra el total de recursos */}
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-center resumen-card">
                <Card.Body>
                  <FaBug size={40} className="mb-2 icono-resumen"/>
                  <h5>Defectos Encontrados</h5>
                  <h3>{TotalDefectosEncontrados}</h3>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          <Row className="mb-4">
            <Col md={6}>
              <Card className="grafica-card">
                <Card.Body>
                  <h5 className="text-center">Pruebas Realizadas por Periodo </h5>
                  <Bar
                  data={barData}
                  options={{
                    plugins: {
                      legend: {
                        labels: {
                          color: 'white', // Cambia el color de las etiquetas de la leyenda a blanco
                        },
                      },
                    },
                    scales: {
                      x: {
                        ticks: {
                          color: 'white',
                        },
                      },
                      y: {
                        ticks: {
                          color: 'white', // Cambia el color de las etiquetas del eje Y a blanco
                        },
                      },
                    },
                  }}
                />
                </Card.Body>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="grafica-card">
                <Card.Body>
                  <h5 className="text-center">Distribución de Pruebas</h5>
                  <Pie 
                  data={pieData} 
                  options={{
                    plugins: {
                      legend: {
                        labels: {
                          color: 'whitesmoke', // Color de las etiquetas de la leyenda
                        },
                      },
                    },
                  }} 
                />
                </Card.Body>
              </Card>
            </Col>
          </Row>
          <Outlet />  {/* Renderiza los componentes del menú según la ruta */}
        </Col>
      </Row>
    </Container>
  );
}

export default Dashboard;
