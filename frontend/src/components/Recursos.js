import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Row, Col, Table, ButtonGroup, Button, Modal, Form } from 'react-bootstrap';
import { FaTrash, FaPen } from 'react-icons/fa'; // Importa los íconos
import Swal from 'sweetalert2'; // Importa SweetAlert2
import Sidebar from './Sidebar';
import '../Dashboard.css';
import '../estilos.css';

function Recursos() {
  const [showModal, setShowModal] = useState(false);
  const [recursos, setRecursos] = useState([]);
  const [nuevoRecurso, setNuevoRecurso] = useState({
    nombre_recurso: '',
    tipo_recurso: '',
    descripcion: '',
    disponibilidad: 'Disponible'
  });

  // Obtener los recursos desde el backend
  useEffect(() => {
    axios.get('http://localhost:5000/recursos')
      .then(response => {
        setRecursos(response.data);
      })
      .catch(error => {
        console.log('Error al obtener los recursos:', error);
      });
  }, []);

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => {
    setShowModal(false);
    setNuevoRecurso({
      nombre_recurso: '',
      tipo_recurso: '',
      descripcion: '',
      disponibilidad: 'Disponible'
    });
    setRecursoSeleccionado(null); // Resetear el recurso seleccionado al cerrar el modal
  };

  // Manejar cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNuevoRecurso((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Agregar un nuevo recurso
  const handleAgregarRecurso = () => {
    axios.post('http://localhost:5000/recursos', nuevoRecurso)
      .then(response => {
      const { id_recurso } = response.data; // Asegúrate de que el ID viene en la respuesta
      const recursoConId = { ...nuevoRecurso, id_recurso }; // Agrega el ID al recurso

      setRecursos([...recursos, recursoConId]); // Actualiza la lista de recursos en el estado
      handleCloseModal(); // Cierra el modal

        // Alertas de SweetAlert
        Swal.fire({
          title: 'Éxito!',
          text: 'Recurso agregado correctamente!',
          icon: 'success',
          confirmButtonText: 'Aceptar'
        }).then(() => {
          // Recargar la página después de 5 segundos
          setTimeout(() => {
            window.location.reload(); // Recargar la página
          }, 1500); // Espera 5 segundos antes de recargar
        });
      })
      .catch(error => {
        console.error('Error al agregar el recurso:', error);
        Swal.fire({
          title: 'Error!',
          text: 'No se pudo agregar el recurso!',
          icon: 'error',
          confirmButtonText: 'Aceptar'
        });
      });
  };

  const [recursoSeleccionado, setRecursoSeleccionado] = useState(null); // Estado para manejar el recurso seleccionado

  const handleShowUpdateModal = (recurso) => {
    setRecursoSeleccionado(recurso);
    setNuevoRecurso({
      nombre_recurso: recurso.nombre_recurso,
      tipo_recurso: recurso.tipo_recurso,
      descripcion: recurso.descripcion,
      disponibilidad: recurso.disponibilidad,
    });
    setShowModal(true); // Abrir el modal con los datos cargados
  };

  // Actualizar un recurso
  const handleActualizarRecurso = () => {
    if (recursoSeleccionado) {
      axios.put(`http://localhost:5000/recursos/${recursoSeleccionado.id_recurso}`, nuevoRecurso) // Usa 'id_recurso' en lugar de 'id'
        .then(response => {
          console.log('Recurso actualizado con éxito:', response.data);
          setRecursos(recursos.map(r => (r.id_recurso === recursoSeleccionado.id_recurso ? { ...r, ...nuevoRecurso } : r)));
          handleCloseModal();

          // Alertas de SweetAlert
          Swal.fire({
            title: 'Éxito!',
            text: 'Recurso actualizado correctamente!',
            icon: 'success',
            confirmButtonText: 'Aceptar'
          });
        })
        .catch(error => {
          console.error('Error al actualizar el recurso:', error);
          Swal.fire({
            title: 'Error!',
            text: 'No se pudo actualizar el recurso!',
            icon: 'error',
            confirmButtonText: 'Aceptar'
          });
        });
    }
  };

  // Eliminar un recurso
  const handleEliminarRecurso = (id) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar!',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        axios.delete(`http://localhost:5000/recursos/${id}`)
          .then(() => {
            setRecursos(recursos.filter(recurso => recurso.id_recurso !== id)); // Cambia 'id' a 'id_recurso'

            // Alertas de SweetAlert
            Swal.fire({
              title: 'Eliminado!',
              text: 'El recurso ha sido eliminado.',
              icon: 'success',
              confirmButtonText: 'Aceptar'
            });
          })
          .catch(error => {
            console.log('Error al eliminar el recurso:', error);
            Swal.fire({
              title: 'Error!',
              text: 'No se pudo eliminar el recurso!',
              icon: 'error',
              confirmButtonText: 'Aceptar'
            });
          });
      }
    });
  };

  const [busqueda, setBusqueda] = useState('');

  // Filtrar recursos
  const recursosFiltrados = recursos.filter(recurso =>
    recurso.nombre_recurso.toLowerCase().includes(busqueda.toLowerCase()) ||
    recurso.tipo_recurso.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <Row>
      <Col xs={2}>
        <Sidebar />
      </Col>
      <Col xs={10} className="p-4">
        <h1>CONTROL DE RECURSOS</h1>

        <ButtonGroup className="mb-3">
          <Button variant="success" onClick={handleShowModal}>Añadir Registro</Button>
        </ButtonGroup>

        {/* Input de búsqueda */}
        <Form.Control
          type="text"
          placeholder="Buscar recurso..."
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
              <th>Tipo</th>
              <th>Descripción</th>
              <th>Disponibilidad</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
          {recursosFiltrados.length > 0 ? (
            recursosFiltrados.map((recurso) => (
              <tr key={recurso.id_recurso}>
                <td>{recurso.id_recurso}</td>
                <td>{recurso.nombre_recurso}</td>
                <td>{recurso.tipo_recurso}</td>
                <td>{recurso.descripcion}</td>
                <td>{recurso.disponibilidad}</td>
                <td>
                  <Button variant="primary" onClick={() => handleShowUpdateModal(recurso)}>
                    <FaPen />
                  </Button>{' '}
                  <Button variant="danger" onClick={() => handleEliminarRecurso(recurso.id_recurso)}>
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
            <Modal.Title>{recursoSeleccionado ? 'Actualizar Recurso' : 'Agregar Recurso'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Nombre del Recurso</Form.Label>
                <Form.Control
                  type="text"
                  name="nombre_recurso"
                  value={nuevoRecurso.nombre_recurso}
                  onChange={handleChange}
                  placeholder="Ingrese el nombre del recurso"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Tipo de Recurso</Form.Label>
                <Form.Control
                  type="text"
                  name="tipo_recurso"
                  value={nuevoRecurso.tipo_recurso}
                  onChange={handleChange}
                  placeholder="Ingrese el tipo de recurso"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Descripción</Form.Label>
                <Form.Control
                  as="textarea"
                  name="descripcion"
                  value={nuevoRecurso.descripcion}
                  onChange={handleChange}
                  placeholder="Ingrese una descripción"
                  rows={3}
                  style={{ resize: 'none' }}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Disponibilidad</Form.Label>
                <Form.Select
                  name="disponibilidad"
                  value={nuevoRecurso.disponibilidad}
                  onChange={handleChange}
                >
                  <option value="Disponible">Disponible</option>
                  <option value="No disponible">No disponible</option>
                </Form.Select>
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="success" style={{ fontWeight: 'bold' }} onClick={recursoSeleccionado ? handleActualizarRecurso : handleAgregarRecurso}>
              {recursoSeleccionado ? 'Actualizar' : 'Guardar'} 
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

export default Recursos;
