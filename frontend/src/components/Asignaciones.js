import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Row, Col, Table, ButtonGroup, Button, Modal, Form } from 'react-bootstrap';
import { FaTrash, FaPen } from 'react-icons/fa';
import Swal from 'sweetalert2';
import Sidebar from './Sidebar';
import '../Dashboard.css';
import '../estilos.css';

function Asignaciones() {
  const [showModal, setShowModal] = useState(false);
  const [asignaciones, setAsignaciones] = useState([]);
  const [nuevaAsignacion, setNuevaAsignacion] = useState({
    id_colaborador: '',
    id_proyecto: '',
    id_recurso: '',
    estado: ''
  });
  const [colaboradores, setColaboradores] = useState([]);
  const [proyectos, setProyectos] = useState([]);
  const [recursos, setRecursos] = useState([]);

  useEffect(() => {
    fetchAsignaciones();
  }, []);

  const fetchAsignaciones = () => {
    axios.get('http://localhost:5000/asignacion_proyecto')
      .then(response => {
        setAsignaciones(response.data);
      })
      .catch(error => {
        console.log('Error al obtener las asignaciones:', error);
      });
  };

  // Obtener colaboradores
  useEffect(() => {
    axios.get('http://localhost:5000/colaboradores') // Asegúrate de que esta ruta sea correcta
      .then(response => setColaboradores(response.data))
      .catch(error => console.error('Error al obtener los colaboradores:', error));
  }, []);

  // Obtener proyectos
  useEffect(() => {
    axios.get('http://localhost:5000/proyectos') // Asegúrate de que esta ruta sea correcta
      .then(response => setProyectos(response.data))
      .catch(error => console.error('Error al obtener los proyectos:', error));
  }, []);

  // Obtener recursos
  useEffect(() => {
    axios.get('http://localhost:5000/recursos') // Asegúrate de que esta ruta sea correcta
      .then(response => setRecursos(response.data))
      .catch(error => console.error('Error al obtener los recursos:', error));
  }, []);

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => {
    setShowModal(false);
    setNuevaAsignacion({
      id_colaborador: '',
      id_proyecto: '',
      id_recurso: '',
      estado: ''
    });
    setAsignacionSeleccionada(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNuevaAsignacion((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAgregarAsignacion = () => {
    axios.post('http://localhost:5000/asignacion_proyecto', nuevaAsignacion)
      .then(response => {
        const { id_asignacion } = response.data;
        const asignacionConId = { ...nuevaAsignacion, id_asignacion };
        setAsignaciones([...asignaciones, asignacionConId]);
        fetchAsignaciones();
        handleCloseModal();

        Swal.fire({
          title: 'Éxito!',
          text: 'Asignación agregada correctamente!',
          icon: 'success',
          confirmButtonText: 'Aceptar'
        });
      })
      .catch(error => {
        console.error('Error al agregar la asignación:', error);
        Swal.fire({
          title: 'Error!',
          text: 'No se pudo agregar la asignación!',
          icon: 'error',
          confirmButtonText: 'Aceptar'
        });
      });
  };

  const [asignacionSeleccionada, setAsignacionSeleccionada] = useState(null);

  const handleShowUpdateModal = (asignacion) => {
    setAsignacionSeleccionada(asignacion);
    setNuevaAsignacion({
      id_colaborador: asignacion.id_colaborador,
      id_proyecto: asignacion.id_proyecto,
      id_recurso: asignacion.id_recurso,
      estado: asignacion.estado
    });
    setShowModal(true);
  };

  const handleActualizarAsignacion = () => {
    if (asignacionSeleccionada) {
      axios.put(`http://localhost:5000/asignacion_proyecto/${asignacionSeleccionada.id_asignacion}`, nuevaAsignacion)
        .then(response => {
          setAsignaciones(asignaciones.map(a => (a.id_asignacion === asignacionSeleccionada.id_asignacion ? { ...a, ...nuevaAsignacion } : a)));
          fetchAsignaciones();
          handleCloseModal();

          Swal.fire({
            title: 'Éxito!',
            text: 'Asignación actualizada correctamente!',
            icon: 'success',
            confirmButtonText: 'Aceptar'
          });
        })
        .catch(error => {
          console.error('Error al actualizar la asignación:', error);
          Swal.fire({
            title: 'Error!',
            text: 'No se pudo actualizar la asignación!',
            icon: 'error',
            confirmButtonText: 'Aceptar'
          });
        });
    }
  };

  const handleEliminarAsignacion = (id) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar!',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        axios.delete(`http://localhost:5000/asignacion_proyecto/${id}`)
          .then(() => {
            setAsignaciones(asignaciones.filter(asignacion => asignacion.id_asignacion !== id));

            Swal.fire({
              title: 'Eliminado!',
              text: 'La asignación ha sido eliminada.',
              icon: 'success',
              confirmButtonText: 'Aceptar'
            });
          })
          .catch(error => {
            console.log('Error al eliminar la asignación:', error);
            Swal.fire({
              title: 'Error!',
              text: 'No se pudo eliminar la asignación!',
              icon: 'error',
              confirmButtonText: 'Aceptar'
            });
          });
      }
    });
  };

  const [busqueda, setBusqueda] = useState('');

  const asignacionesFiltradas = asignaciones.filter(asignacion =>
    asignacion.id_asignacion.toString().includes(busqueda) ||
    asignacion.id_colaborador.toString().includes(busqueda) ||
    asignacion.id_proyecto.toString().includes(busqueda) ||
    asignacion.id_recurso.toString().includes(busqueda) ||
    asignacion.estado.toString().includes(busqueda)
  );

  return (
    <Row>
      <Col xs={2}>
        <Sidebar />
      </Col>
      <Col xs={10} className="p-4">
        <h1>SEGUIMIENTO DE PROYECTOS</h1>

        <ButtonGroup className="mb-3">
          <Button variant="success" onClick={handleShowModal}>Añadir Asignación</Button>
        </ButtonGroup>

        {/* Input de búsqueda */}
        <Form.Control
          type="text"
          placeholder="Buscar asignación..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="mb-3"
        />

        <div style={{ overflowX: 'auto', maxHeight: '530px' }}>
          <Table className="table-custom" striped bordered hover>
            <thead>
              <tr>
                <th>ID</th>
                <th>Colaborador</th>
                <th>Proyecto</th>
                <th>Recurso</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {asignacionesFiltradas.length > 0 ? (
                asignacionesFiltradas.map((asignacion) => (
                  <tr key={asignacion.id_asignacion}>
                    <td>{asignacion.id_asignacion}</td>
                    <td>{asignacion.nombre_colaborador}</td>
                    <td>{asignacion.nombre_proyecto}</td>
                    <td>{asignacion.nombre_recurso}</td>
                    <td>{asignacion.estado}</td>
                    <td>
                      <Button variant="primary" onClick={() => handleShowUpdateModal(asignacion)}>
                        <FaPen />
                      </Button>{' '}
                      <Button variant="danger" onClick={() => handleEliminarAsignacion(asignacion.id_asignacion)}>
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
            <Modal.Title>{asignacionSeleccionada ? 'Actualizar Asignación' : 'Agregar Asignación'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Colaborador</Form.Label>
                <Form.Select name="id_colaborador" value={nuevaAsignacion.id_colaborador} onChange={handleChange}>
                  <option value="">Seleccionar Colaborador</option>
                  {colaboradores.map(colaborador => (
                    <option key={colaborador.id_colaborador} value={colaborador.id_colaborador}>{colaborador.nombre}</option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Proyecto</Form.Label>
                <Form.Select name="id_proyecto" value={nuevaAsignacion.id_proyecto} onChange={handleChange}>
                  <option value="">Seleccionar Proyecto</option>
                  {proyectos.map(proyecto => (
                    <option key={proyecto.id_proyecto} value={proyecto.id_proyecto}>{proyecto.nombre}</option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Recurso</Form.Label>
                <Form.Select name="id_recurso" value={nuevaAsignacion.id_recurso} onChange={handleChange}>
                  <option value="">Seleccionar Recurso</option>
                  {recursos.map(recurso => (
                    <option key={recurso.id_recurso} value={recurso.id_recurso}>{recurso.nombre_recurso}</option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Estado</Form.Label>
                <Form.Control type="text" name="estado" value={nuevaAsignacion.estado} onChange={handleChange} placeholder="Estado" />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
          <Button variant="success" onClick={asignacionSeleccionada ? handleActualizarAsignacion : handleAgregarAsignacion}>
              {asignacionSeleccionada ? 'Actualizar' : 'Agregar'}
            </Button>
            <Button variant="danger" onClick={handleCloseModal}>Cerrar</Button>
          </Modal.Footer>
        </Modal>
      </Col>
    </Row>
  );
}

export default Asignaciones;
