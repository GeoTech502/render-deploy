import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Row, Col, Table, ButtonGroup, Button, Modal, Form } from 'react-bootstrap';
import { FaTrash, FaPen } from 'react-icons/fa';
import Swal from 'sweetalert2';
import Sidebar from './Sidebar';
import '../Dashboard.css';
import '../estilos.css';

function PlanPruebas() {
  const [showModal, setShowModal] = useState(false);
  const [planesPruebas, setPlanesPruebas] = useState([]);
  const [nuevoPlanPrueba, setNuevoPlanPrueba] = useState({
    nombre_plan: '',
    descripcion: '',
    fecha_creacion: '',
    id_proyecto: ''
  });
  const [proyectos, setProyectos] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/planpruebas')
      .then(response => {
        const PlanPruebasConFechasFormateadas = response.data.map(planPrueba => ({
          ...planPrueba,
          fecha_creacion: new Date(planPrueba.fecha_creacion).toLocaleDateString('es-ES'), // Asegúrate de usar 'fecha_creacion'
          nombre_proyecto: planPrueba.nombre_proyecto
        }));
        setPlanesPruebas(PlanPruebasConFechasFormateadas);
      })
      .catch(error => {
        console.log('Error al obtener los planes de prueba:', error);
      });
  }, []);
  

  // Obtener proyectos
  useEffect(() => {
    axios.get('http://localhost:5000/proyectos')
      .then(response => setProyectos(response.data))
      .catch(error => console.error('Error al obtener los proyectos:', error));
  }, []);

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => {
    setShowModal(false);
    setNuevoPlanPrueba({
      nombre_plan: '',
      descripcion: '',
      fecha_creacion: '',
      id_proyecto: ''
    });
    setPlanPruebaSeleccionado(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNuevoPlanPrueba((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAgregarPlanPrueba = () => {
    axios.post('http://localhost:5000/planpruebas', nuevoPlanPrueba)
      .then(response => {
        const { id_plan } = response.data;
        const planPruebaConId = { ...nuevoPlanPrueba, id_plan };

        setPlanesPruebas([...planesPruebas, planPruebaConId]);
        handleCloseModal();

        Swal.fire({
          title: 'Éxito!',
          text: 'Plan de prueba agregado correctamente!',
          icon: 'success',
          confirmButtonText: 'Aceptar'
        });
      })
      .catch(error => {
        console.error('Error al agregar el plan de prueba:', error);
        Swal.fire({
          title: 'Error!',
          text: 'No se pudo agregar el plan de prueba!',
          icon: 'error',
          confirmButtonText: 'Aceptar'
        });
      });
  };

  const [planPruebaSeleccionado, setPlanPruebaSeleccionado] = useState(null);

  const handleShowUpdateModal = (planPrueba) => {
    setPlanPruebaSeleccionado(planPrueba);
    setNuevoPlanPrueba({
      nombre_plan: planPrueba.nombre_plan,
      descripcion: planPrueba.descripcion,
      fecha_creacion: planPrueba.fecha_creacion,
      id_proyecto: planPrueba.id_proyecto,
    });
    setShowModal(true);
  };

  const handleActualizarPlanPrueba = () => {
    if (planPruebaSeleccionado) {
      axios.put(`http://localhost:5000/planpruebas/${planPruebaSeleccionado.id_plan}`, nuevoPlanPrueba)
        .then(response => {
          setPlanesPruebas(planesPruebas.map(p => (p.id_plan === planPruebaSeleccionado.id_plan ? { ...p, ...nuevoPlanPrueba } : p)));
          handleCloseModal();

          Swal.fire({
            title: 'Éxito!',
            text: 'Plan de prueba actualizado correctamente!',
            icon: 'success',
            confirmButtonText: 'Aceptar'
          });
        })
        .catch(error => {
          console.error('Error al actualizar el plan de prueba:', error);
          Swal.fire({
            title: 'Error!',
            text: 'No se pudo actualizar el plan de prueba!',
            icon: 'error',
            confirmButtonText: 'Aceptar'
          });
        });
    }
  };

  const handleEliminarPlanPrueba = (id) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar!',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        axios.delete(`http://localhost:5000/planpruebas/${id}`)
          .then(() => {
            setPlanesPruebas(planesPruebas.filter(planPrueba => planPrueba.id_plan !== id));

            Swal.fire({
              title: 'Eliminado!',
              text: 'El plan de prueba ha sido eliminado.',
              icon: 'success',
              confirmButtonText: 'Aceptar'
            });
          })
          .catch(error => {
            console.log('Error al eliminar el plan de prueba:', error);
            Swal.fire({
              title: 'Error!',
              text: 'No se pudo eliminar el plan de prueba!',
              icon: 'error',
              confirmButtonText: 'Aceptar'
            });
          });
      }
    });
  };

  const [busqueda, setBusqueda] = useState('');

  const planesPruebasFiltrados = planesPruebas.filter(planPrueba =>
    planPrueba.nombre_plan.toLowerCase().includes(busqueda.toLowerCase()) ||
    planPrueba.descripcion.toLowerCase().includes(busqueda.toLowerCase()) ||
    planPrueba.id_plan.toString().includes(busqueda)
  );

  return (
    <Row>
      <Col xs={2}>
        <Sidebar />
      </Col>
      <Col xs={10} className="p-4">
        <h1>CONTROL DE PLANES DE PRUEBA</h1>

        <ButtonGroup className="mb-3">
          <Button variant="success" onClick={handleShowModal}>Añadir Registro</Button>
        </ButtonGroup>

        {/* Input de búsqueda */}
        <Form.Control
          type="text"
          placeholder="Buscar plan de prueba..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="mb-3"
        />

        <div style={{ overflowX: 'auto', maxHeight: '530px' }}>  
        <Table className="table-custom" striped bordered hover >
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Fecha de Creación</th>
              <th>Proyecto</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
          {planesPruebasFiltrados.length > 0 ? (
            planesPruebasFiltrados.map((planPrueba) => (
              <tr key={planPrueba.id_plan}>
                <td>{planPrueba.id_plan}</td>
                <td>{planPrueba.nombre_plan}</td>
                <td>{planPrueba.descripcion}</td>
                <td>{planPrueba.fecha_creacion}</td>
                <td>{planPrueba.id_proyecto}</td>
                <td>
                  <Button variant="primary" onClick={() => handleShowUpdateModal(planPrueba)}>
                    <FaPen />
                  </Button>{' '}
                  <Button variant="danger" onClick={() => handleEliminarPlanPrueba(planPrueba.id_plan)}>
                    <FaTrash />
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="text-center">No hay datos disponibles</td>
            </tr>
          )}
        </tbody>
        </Table>
        </div>

        <Modal show={showModal} onHide={handleCloseModal}>
          <Modal.Header closeButton>
            <Modal.Title>{planPruebaSeleccionado ? 'Actualizar plan de prueba' : 'Agregar plan de prueba'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Nombre del Plan</Form.Label>
                <Form.Control
                  type="text"
                  name="nombre_plan"
                  value={nuevoPlanPrueba.nombre_plan}
                  onChange={handleChange}
                  placeholder="Ingrese el nombre del plan"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Descripción</Form.Label>
                <Form.Control
                  as="textarea"
                  name="descripcion"
                  value={nuevoPlanPrueba.descripcion}
                  onChange={handleChange}
                  placeholder="Ingrese una descripción"
                  rows={3}
                  style={{ resize: 'none' }}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Fecha de Creación</Form.Label>
                <Form.Control
                  type="date"
                  name="fecha_creacion"
                  value={nuevoPlanPrueba.fecha_creacion}
                  onChange={handleChange}
                />
              </Form.Group>
              
              <Form.Group className="mb-3">
                <Form.Label>Proyecto</Form.Label>
                <Form.Control as="select" name="id_proyecto" value={nuevoPlanPrueba.id_proyecto} onChange={handleChange}>
                  <option value="">Seleccione un proyecto</option>
                  {proyectos.map((proyecto) => (
                    <option key={proyecto.id_proyecto} value={proyecto.id_proyecto}>{proyecto.nombre}</option>
                  ))}
                </Form.Control>
              </Form.Group>

            </Form>
          </Modal.Body>
          <Modal.Footer>
          <Button variant="success" style={{ fontWeight: 'bold' }} onClick={planPruebaSeleccionado ? handleActualizarPlanPrueba : handleAgregarPlanPrueba}>
              {planPruebaSeleccionado ? 'Actualizar' : 'Agregar'}
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

export default PlanPruebas;
