import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Row, Col, Table, ButtonGroup, Button, Modal, Form } from 'react-bootstrap';
import { FaTrash, FaPen } from 'react-icons/fa';
import Swal from 'sweetalert2';
import Sidebar from './Sidebar';
import '../Dashboard.css';
import '../estilos.css';

function Metricas() {
  const [showModal, setShowModal] = useState(false);
  const [metricas, setMetricas] = useState([]);
  const [nuevaMetrica, setNuevaMetrica] = useState({
    id_proyecto: '',
    total_pruebas: '',
    pruebas_exitosas: '',
    pruebas_fallidas: '',
    defectos_encontrados: '',
    defectos_resueltos: '',
    fecha_generacion: ''
  });
  const [proyectos, setProyectos] = useState([]);

  // Obtener datos de métricas y proyectos
  useEffect(() => {
    fetchMetricas();
    fetchProyectos();
  }, []);

  const fetchMetricas = () => {
    axios.get('http://localhost:5000/metricas')
      .then(response => {
        const metricasPruebasConFechasFormateadas = response.data.map(metricaPrueba => ({
          ...metricaPrueba,
          fecha_generacion: new Date(metricaPrueba.fecha_generacion).toLocaleDateString('es-ES'), 
          nombre_caso: metricaPrueba.nombre_caso 
        }));
        setMetricas(metricasPruebasConFechasFormateadas); 
      })
      .catch(error => {
        console.log('Error al obtener las ejecuciones de prueba:', error);
      });
  };

  const fetchProyectos = () => {
    axios.get('http://localhost:5000/proyectos')
      .then(response => setProyectos(response.data))
      .catch(error => console.error('Error al obtener los proyectos:', error));
  };

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => {
    setShowModal(false);
    setNuevaMetrica({
      id_proyecto: '',
      total_pruebas: '',
      pruebas_exitosas: '',
      pruebas_fallidas: '',
      defectos_encontrados: '',
      defectos_resueltos: '',
      fecha_generacion: ''
    });
    setMetricaSeleccionada(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNuevaMetrica((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAgregarMetrica = () => {
    axios.post('http://localhost:5000/metricas', nuevaMetrica)
      .then(response => {
        fetchMetricas();
        handleCloseModal();

        Swal.fire({
          title: 'Éxito!',
          text: 'Métrica agregada correctamente!',
          icon: 'success',
          confirmButtonText: 'Aceptar'
        });
      })
      .catch(error => {
        console.error('Error al agregar la métrica:', error);
        Swal.fire({
          title: 'Error!',
          text: 'No se pudo agregar la métrica!',
          icon: 'error',
          confirmButtonText: 'Aceptar'
        });
      });
  };

  const [metricaSeleccionada, setMetricaSeleccionada] = useState(null);

  const handleShowUpdateModal = (metrica) => {
    setMetricaSeleccionada(metrica);
    setNuevaMetrica({
      id_proyecto: metrica.id_proyecto,
      total_pruebas: metrica.total_pruebas,
      pruebas_exitosas: metrica.pruebas_exitosas,
      pruebas_fallidas: metrica.pruebas_fallidas,
      defectos_encontrados: metrica.defectos_encontrados,
      defectos_resueltos: metrica.defectos_resueltos,
      fecha_generacion: metrica.fecha_generacion
    });
    setShowModal(true);
  };

  const handleActualizarMetrica = () => {
    if (metricaSeleccionada) {
      axios.put(`http://localhost:5000/metricas/${metricaSeleccionada.id_metrica}`, nuevaMetrica)
        .then(response => {
          fetchMetricas();
          handleCloseModal();

          Swal.fire({
            title: 'Éxito!',
            text: 'Métrica actualizada correctamente!',
            icon: 'success',
            confirmButtonText: 'Aceptar'
          });
        })
        .catch(error => {
          console.error('Error al actualizar la métrica:', error);
          Swal.fire({
            title: 'Error!',
            text: 'No se pudo actualizar la métrica!',
            icon: 'error',
            confirmButtonText: 'Aceptar'
          });
        });
    }
  };

  const handleEliminarMetrica = (id_metrica) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar!',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        axios.delete(`http://localhost:5000/metricas/${id_metrica}`)
          .then(() => {
            fetchMetricas();

            Swal.fire({
              title: 'Eliminado!',
              text: 'La métrica ha sido eliminada.',
              icon: 'success',
              confirmButtonText: 'Aceptar'
            });
          })
          .catch(error => {
            console.log('Error al eliminar la métrica:', error);
            Swal.fire({
              title: 'Error!',
              text: 'No se pudo eliminar la métrica!',
              icon: 'error',
              confirmButtonText: 'Aceptar'
            });
          });
      }
    });
  };

  const [busqueda, setBusqueda] = useState('');

  const metricasFiltradas = metricas.filter(metrica =>
    metrica.id_proyecto.toString().includes(busqueda) ||
    metrica.total_pruebas.toString().includes(busqueda) ||
    metrica.pruebas_exitosas.toString().includes(busqueda) ||
    metrica.pruebas_fallidas.toString().includes(busqueda) ||
    metrica.defectos_encontrados.toString().includes(busqueda) ||
    metrica.defectos_resueltos.toString().includes(busqueda)
  );

  return (
    <Row>
      <Col xs={2}>
        <Sidebar />
      </Col>
      <Col xs={10} className="p-4">
        <h1>CONTROL DE MÉTRICAS</h1>

        <ButtonGroup className="mb-3">
          <Button variant="success" onClick={handleShowModal}>Añadir Registro</Button>
        </ButtonGroup>

        {/* Input de búsqueda */}
        <Form.Control
          type="text"
          placeholder="Buscar métrica..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="mb-3"
        />

        <div style={{ overflowX: 'auto', maxHeight: '530px' }}>
        <Table className="table-custom" striped bordered hover>
          <thead>
            <tr>
              <th>ID Métrica</th>
              <th>Proyecto</th>
              <th>Total Pruebas</th>
              <th>Pruebas Exitosas</th>
              <th>Pruebas Fallidas</th>
              <th>Defectos Encontrados</th>
              <th>Defectos Resueltos</th>
              <th>Fecha Generación</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
          {metricasFiltradas.length > 0 ? (
            metricasFiltradas.map((metrica) => (
              <tr key={metrica.id_metrica}>
                <td>{metrica.id_metrica}</td>
                <td>{metrica.nombre_proyecto}</td>
                <td>{metrica.total_pruebas}</td>
                <td>{metrica.pruebas_exitosas}</td>
                <td>{metrica.pruebas_fallidas}</td>
                <td>{metrica.defectos_encontrados}</td>
                <td>{metrica.defectos_resueltos}</td>
                <td>{metrica.fecha_generacion}</td>
                <td>
                  <Button variant="primary" onClick={() => handleShowUpdateModal(metrica)}>
                    <FaPen />
                  </Button>{' '}
                  <Button variant="danger" onClick={() => handleEliminarMetrica(metrica.id)}> {/* Cambia 'id' si es necesario */}
                    <FaTrash />
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" className="text-center">No hay datos disponibles</td>
            </tr>
          )}
        </tbody>
        </Table>
        </div>

        <Modal show={showModal} onHide={handleCloseModal}>
          <Modal.Header closeButton>
            <Modal.Title>{metricaSeleccionada ? 'Actualizar métrica' : 'Agregar métrica'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>ID Proyecto</Form.Label>
                <Form.Select name="id_proyecto" value={nuevaMetrica.id_proyecto} onChange={handleChange}>
                <option value="">Seleccionar proyecto</option>
                {proyectos.map(proyecto => (
                  <option key={proyecto.id_proyecto} value={proyecto.id_proyecto}>
                    {proyecto.nombre} {/* Mostrar el nombre del proyecto */}
                  </option>
                ))}
              </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Total Pruebas</Form.Label>
                <Form.Control type="number" name="total_pruebas" value={nuevaMetrica.total_pruebas} onChange={handleChange} />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Pruebas Exitosas</Form.Label>
                <Form.Control type="number" name="pruebas_exitosas" value={nuevaMetrica.pruebas_exitosas} onChange={handleChange} />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Pruebas Fallidas</Form.Label>
                <Form.Control type="number" name="pruebas_fallidas" value={nuevaMetrica.pruebas_fallidas} onChange={handleChange} />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Defectos Encontrados</Form.Label>
                <Form.Control type="number" name="defectos_encontrados" value={nuevaMetrica.defectos_encontrados} onChange={handleChange} />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Defectos Resueltos</Form.Label>
                <Form.Control type="number" name="defectos_resueltos" value={nuevaMetrica.defectos_resueltos} onChange={handleChange} />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Fecha Generación</Form.Label>
                <Form.Control type="date" name="fecha_generacion" value={nuevaMetrica.fecha_generacion} onChange={handleChange} />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="success"
              onClick={metricaSeleccionada ? handleActualizarMetrica : handleAgregarMetrica}
              style={{ fontWeight: 'bold' }} 
            >
              {metricaSeleccionada ? 'Actualizar' : 'Guardar'}
            </Button>
            <Button variant="danger" style={{ fontWeight: 'bold' }} onClick={handleCloseModal}>
              Cerrar
            </Button>
          </Modal.Footer>
        </Modal>
      </Col>
    </Row>
  );
}

export default Metricas;
