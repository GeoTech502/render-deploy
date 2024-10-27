import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import 'bootstrap/dist/css/bootstrap.min.css';
import Recursos from './components/Recursos';
import Proyectos from './components/Proyectos';
import Colaboradores from './components/Colaboradores';
import Asignaciones from './components/Asignaciones';
import PlanPruebas from './components/PlanPruebas';
import CasoPruebas from './components/CasoPruebas';
import EjecucionPrueba from './components/EjecucionPrueba';
import Defectos from './components/Defectos';
import SeguimientoDefectos from './components/SeguimientoDefectos';
import Informes from './components/Informes';
import Metricas from './components/Metricas';
import Usuarios from './components/Usuarios';

import './styles.css';

function App() {
  return (
    <Router>
      <div className='App'>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<Dashboard />} />
          {/* Nueva ruta independiente para Option1 */}
          <Route path="/recursos" element={<Recursos />} />
          <Route path="/proyectos" element={<Proyectos />} />
          <Route path="/colaboradores" element={<Colaboradores />} />
          <Route path="/asignaciones" element={<Asignaciones />} />
          <Route path="/planpruebas" element={<PlanPruebas />} />
          <Route path="/casopruebas" element={<CasoPruebas />} />
          <Route path="/ejecucionprueba" element={<EjecucionPrueba />} />
          <Route path="/defectos" element={<Defectos />} />
          <Route path="/seguimientodefectos" element={<SeguimientoDefectos />} />
          <Route path="/informes" element={<Informes />} />
          <Route path="/metricas" element={<Metricas />} />
          <Route path="/usuarios" element={<Usuarios />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
