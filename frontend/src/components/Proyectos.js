import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Row, Col, Table, ButtonGroup, Button, Modal, Form } from 'react-bootstrap';
import { FaTrash, FaPen } from 'react-icons/fa'; // Importa los íconos
import Swal from 'sweetalert2'; // Importa SweetAlert2
import Sidebar from './Sidebar';
import '../Dashboard.css';
import '../estilos.css';

function Proyectos() {
  const [showModal, setShowModal] = useState(false);
  const [proyectos, setProyectos] = useState([]);
  const [nuevoProyecto, setNuevoProyecto] = useState({
    nombre: '',
    descripcion: '',
    fecha_inicio: '',
    fecha_fin: '',
    estado: ''
  });

  // Obtener los proyectos desde el backend
  useEffect(() => {
    axios.get('http://localhost:5000/proyectos')
      .then(response => {
        setProyectos(response.data);
      })
      .catch(error => {
        console.log('Error al obtener los proyectos:', error);
      });
  }, []);

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => {
    setShowModal(false);
    setNuevoProyecto({
      nombre: '',
      descripcion: '',
      fecha_inicio: '',
      fecha_fin: '',
      estado: ''
    });
    setProyectoSeleccionado(null); // Resetear el proyecto seleccionado al cerrar el modal
  };

  // Manejar cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNuevoProyecto((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Agregar un nuevo proyecto
  const handleAgregarProyecto = () => {
    axios.post('http://localhost:5000/proyectos', nuevoProyecto)
      .then(response => {
        const { id_proyecto } = response.data; // Asegúrate de que el ID viene en la respuesta
        const proyectoConId = { ...nuevoProyecto, id_proyecto }; // Agrega el ID al proyecto

        setProyectos([...proyectos, proyectoConId]); // Actualiza la lista de proyectos en el estado
        handleCloseModal(); // Cierra el modal

        // Alertas de SweetAlert
        Swal.fire({
          title: 'Éxito!',
          text: 'Proyecto agregado correctamente!',
          icon: 'success',
          confirmButtonText: 'Aceptar'
        });
      })
      .catch(error => {
        console.error('Error al agregar el proyecto:', error);
        Swal.fire({
          title: 'Error!',
          text: 'No se pudo agregar el proyecto!',
          icon: 'error',
          confirmButtonText: 'Aceptar'
        });
      });
  };

  const [proyectoSeleccionado, setProyectoSeleccionado] = useState(null); // Estado para manejar el proyecto seleccionado

  const handleShowUpdateModal = (proyecto) => {
    setProyectoSeleccionado(proyecto);
    setNuevoProyecto({
      nombre: proyecto.nombre,
      descripcion: proyecto.descripcion,
      fecha_inicio: proyecto.fecha_inicio,
      fecha_fin: proyecto.fecha_fin,
      estado: proyecto.estado
    });
    setShowModal(true); // Abrir el modal con los datos cargados
  };

  // Actualizar un proyecto
  const handleActualizarProyecto = () => {
    if (proyectoSeleccionado) {
      axios.put(`http://localhost:5000/proyectos/${proyectoSeleccionado.id_proyecto}`, nuevoProyecto)
        .then(response => {
          console.log('Proyecto actualizado con éxito:', response.data);
          setProyectos(proyectos.map(p => (p.id_proyecto === proyectoSeleccionado.id_proyecto ? { ...p, ...nuevoProyecto } : p)));
          handleCloseModal();

          // Alertas de SweetAlert
          Swal.fire({
            title: 'Éxito!',
            text: 'Proyecto actualizado correctamente!',
            icon: 'success',
            confirmButtonText: 'Aceptar'
          });
        })
        .catch(error => {
          console.error('Error al actualizar el proyecto:', error);
          Swal.fire({
            title: 'Error!',
            text: 'No se pudo actualizar el proyecto!',
            icon: 'error',
            confirmButtonText: 'Aceptar'
          });
        });
    }
  };

  // Eliminar un proyecto
  const handleEliminarProyecto = (id) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar!',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        axios.delete(`http://localhost:5000/proyectos/${id}`)
          .then(() => {
            setProyectos(proyectos.filter(proyecto => proyecto.id_proyecto !== id));

            // Alertas de SweetAlert
            Swal.fire({
              title: 'Eliminado!',
              text: 'El proyecto ha sido eliminado.',
              icon: 'success',
              confirmButtonText: 'Aceptar'
            });
          })
          .catch(error => {
            console.log('Error al eliminar el proyecto:', error);
            Swal.fire({
              title: 'Error!',
              text: 'No se pudo eliminar el proyecto!',
              icon: 'error',
              confirmButtonText: 'Aceptar'
            });
          });
      }
    });
  };

  const [busqueda, setBusqueda] = useState('');

  // Filtrar proyectos
  const proyectosFiltrados = proyectos.filter(proyecto =>
    proyecto.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    proyecto.descripcion.toLowerCase().includes(busqueda.toLowerCase()) ||
    proyecto.estado.toLowerCase().includes(busqueda.toLowerCase())
  );

  useEffect(() => {
    axios.get('http://localhost:5000/proyectos')
      .then(response => {
        const proyectosConFechasFormateadas = response.data.map(proyecto => ({
          ...proyecto,
          fecha_inicio: new Date(proyecto.fecha_inicio).toLocaleDateString('es-ES'),
          fecha_fin: new Date(proyecto.fecha_fin).toLocaleDateString('es-ES')
        }));
        setProyectos(proyectosConFechasFormateadas);
      })
      .catch(error => {
        console.log('Error al obtener los proyectos:', error);
      });
  }, []);
  

  return (
    <Row>
      <Col xs={2}>
        <Sidebar />
      </Col>
      <Col xs={10} className="p-4">
        <h1>CONTROL DE PROYECTOS</h1>

        <ButtonGroup className="mb-3">
          <Button variant="success" onClick={handleShowModal}>Añadir Proyecto</Button>
        </ButtonGroup>

        {/* Input de búsqueda */}
        <Form.Control
          type="text"
          placeholder="Buscar proyecto..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="mb-3"
        />

        <div style={{ overflowX: 'auto', maxHeight: '530px' }}> 
          <Table className="table-custom" striped bordered hover>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Descripción</th>
                <th>Fecha de Inicio</th>
                <th>Fecha de Fin</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {proyectosFiltrados.length > 0 ? (
                proyectosFiltrados.map((proyecto) => (
                  <tr key={proyecto.id_proyecto}>
                    <td>{proyecto.id_proyecto}</td>
                    <td>{proyecto.nombre}</td>
                    <td>{proyecto.descripcion}</td>
                    <td>{proyecto.fecha_inicio}</td>
                    <td>{proyecto.fecha_fin}</td>
                    <td>{proyecto.estado}</td>
                    <td>
                      <Button variant="primary" onClick={() => handleShowUpdateModal(proyecto)}>
                        <FaPen />
                      </Button>{' '}
                      <Button variant="danger" onClick={() => handleEliminarProyecto(proyecto.id_proyecto)}>
                        <FaTrash />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center">No hay datos disponibles</td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>

        <Modal show={showModal} onHide={handleCloseModal}>
          <Modal.Header closeButton>
            <Modal.Title>{proyectoSeleccionado ? 'Actualizar Proyecto' : 'Agregar Proyecto'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Nombre</Form.Label>
                <Form.Control
                  type="text"
                  name="nombre"
                  value={nuevoProyecto.nombre}
                  onChange={handleChange}
                  placeholder="Ingrese el nombre del proyecto"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Descripción</Form.Label>
                <Form.Control
                  type="text"
                  name="descripcion"
                  value={nuevoProyecto.descripcion}
                  onChange={handleChange}
                  placeholder="Ingrese la descripción del proyecto"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Fecha de Inicio</Form.Label>
                <Form.Control
                  type="date"
                  name="fecha_inicio"
                  value={nuevoProyecto.fecha_inicio}
                  onChange={handleChange}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Fecha de Fin</Form.Label>
                <Form.Control
                  type="date"
                  name="fecha_fin"
                  value={nuevoProyecto.fecha_fin}
                  onChange={handleChange}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Estado</Form.Label>
                <Form.Control
                  type="text"
                  name="estado"
                  value={nuevoProyecto.estado}
                  onChange={handleChange}
                  placeholder="Ingrese el estado del proyecto"
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="success" style={{ fontWeight: 'bold' }} onClick={proyectoSeleccionado ? handleActualizarProyecto : handleAgregarProyecto}>
              {proyectoSeleccionado ? 'Actualizar' : 'Guardar'} 
            </Button>
            <Button variant="danger" style={{ fontWeight: 'bold' }} onClick={handleCloseModal}>
              Cancelar
            </Button>
          </Modal.Footer>
        </Modal>
      </Col>
    </Row>
  );
}

export default Proyectos;
