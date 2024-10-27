import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Row, Col, Table, ButtonGroup, Button, Modal, Form } from 'react-bootstrap';
import { FaTrash, FaPen } from 'react-icons/fa'; // Importa los íconos
import Swal from 'sweetalert2'; // Importa SweetAlert2
import Sidebar from './Sidebar';
import '../Dashboard.css';
import '../estilos.css';

function Colaboradores() {
  const [showModal, setShowModal] = useState(false);
  const [colaboradores, setColaboradores] = useState([]);
  const [nuevoColaborador, setNuevoColaborador] = useState({
    nombre: '',
    email: '',
    rol: ''
  });

  // Obtener los colaboradores desde el backend
  useEffect(() => {
    axios.get('http://localhost:5000/colaboradores')
      .then(response => {
        setColaboradores(response.data);
      })
      .catch(error => {
        console.log('Error al obtener los colaboradores:', error);
      });
  }, []);

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => {
    setShowModal(false);
    setNuevoColaborador({
      nombre: '',
      email: '',
      rol: ''
    });
    setColaboradorSeleccionado(null); // Resetear el colaborador seleccionado al cerrar el modal
  };

  // Manejar cambios en los campos del formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setNuevoColaborador((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  // Agregar un nuevo colaborador
  const handleAgregarColaborador = () => {
    axios.post('http://localhost:5000/colaboradores', nuevoColaborador)
      .then(response => {
        const { id_colaborador } = response.data; // Asegúrate de que el ID viene en la respuesta
        const colaboradorConId = { ...nuevoColaborador, id_colaborador }; // Agrega el ID al colaborador

        setColaboradores([...colaboradores, colaboradorConId]); // Actualiza la lista de colaboradores en el estado
        handleCloseModal(); // Cierra el modal

        // Alertas de SweetAlert
        Swal.fire({
          title: 'Éxito!',
          text: 'Colaborador agregado correctamente!',
          icon: 'success',
          confirmButtonText: 'Aceptar'
        });
       })
      .catch(error => {
        console.error('Error al agregar el colaborador:', error);
        Swal.fire({
          title: 'Error!',
          text: 'No se pudo agregar el colaborador!',
          icon: 'error',
          confirmButtonText: 'Aceptar'
        });
      });
  };

  const [colaboradorSeleccionado, setColaboradorSeleccionado] = useState(null); // Estado para manejar el colaborador seleccionado

  const handleShowUpdateModal = (colaborador) => {
    setColaboradorSeleccionado(colaborador);
    setNuevoColaborador({
      nombre: colaborador.nombre,
      email: colaborador.email,
      rol: colaborador.rol
    });
    setShowModal(true); // Abrir el modal con los datos cargados
  };

  // Actualizar un colaborador
  const handleActualizarColaborador = () => {
    if (colaboradorSeleccionado) {
      axios.put(`http://localhost:5000/colaboradores/${colaboradorSeleccionado.id_colaborador}`, nuevoColaborador)
        .then(response => {
          console.log('Colaborador actualizado con éxito:', response.data);
          setColaboradores(colaboradores.map(c => (c.id_colaborador === colaboradorSeleccionado.id_colaborador ? { ...c, ...nuevoColaborador } : c)));
          handleCloseModal();

          // Alertas de SweetAlert
          Swal.fire({
            title: 'Éxito!',
            text: 'Colaborador actualizado correctamente!',
            icon: 'success',
            confirmButtonText: 'Aceptar'
          });
        })
        .catch(error => {
          console.error('Error al actualizar el colaborador:', error);
          Swal.fire({
            title: 'Error!',
            text: 'No se pudo actualizar el colaborador!',
            icon: 'error',
            confirmButtonText: 'Aceptar'
          });
        });
    }
  };

  // Eliminar un colaborador
  const handleEliminarColaborador = (id) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar!',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        axios.delete(`http://localhost:5000/colaboradores/${id}`)
          .then(() => {
            setColaboradores(colaboradores.filter(colaborador => colaborador.id_colaborador !== id));

            // Alertas de SweetAlert
            Swal.fire({
              title: 'Eliminado!',
              text: 'El colaborador ha sido eliminado.',
              icon: 'success',
              confirmButtonText: 'Aceptar'
            });
          })
          .catch(error => {
            console.log('Error al eliminar el colaborador:', error);
            Swal.fire({
              title: 'Error!',
              text: 'No se pudo eliminar el colaborador!',
              icon: 'error',
              confirmButtonText: 'Aceptar'
            });
          });
      }
    });
  };

  const [busqueda, setBusqueda] = useState('');

  // Filtrar colaboradores
  const colaboradoresFiltrados = colaboradores.filter(colaborador =>
    colaborador.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    colaborador.email.toLowerCase().includes(busqueda.toLowerCase()) ||
    colaborador.rol.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <Row>
      <Col xs={2}>
        <Sidebar />
      </Col>
      <Col xs={10} className="p-4">
        <h1>CONTROL DE COLABORADORES</h1>

        <ButtonGroup className="mb-3">
          <Button variant="success" onClick={handleShowModal}>Añadir Colaborador</Button>
        </ButtonGroup>

        {/* Input de búsqueda */}
        <Form.Control
          type="text"
          placeholder="Buscar colaborador..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="mb-3"
        />

        <div style={{ overflowX: 'auto', maxHeight: '490px' }}> 
          <Table className="table-custom" striped bordered hover>
            <thead>
              <tr>
                <th>ID</th>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {colaboradoresFiltrados.length > 0 ? (
                colaboradoresFiltrados.map((colaborador) => (
                  <tr key={colaborador.id_colaborador}>
                    <td>{colaborador.id_colaborador}</td>
                    <td>{colaborador.nombre}</td>
                    <td>{colaborador.email}</td>
                    <td>{colaborador.rol}</td>
                    <td>
                      <Button variant="primary" onClick={() => handleShowUpdateModal(colaborador)}>
                        <FaPen />
                      </Button>{' '}
                      <Button variant="danger" onClick={() => handleEliminarColaborador(colaborador.id_colaborador)}>
                        <FaTrash />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="text-center">No hay datos disponibles</td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>

        <Modal show={showModal} onHide={handleCloseModal}>
          <Modal.Header closeButton>
            <Modal.Title>{colaboradorSeleccionado ? 'Actualizar Colaborador' : 'Agregar Colaborador'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Nombre</Form.Label>
                <Form.Control
                  type="text"
                  name="nombre"
                  value={nuevoColaborador.nombre}
                  onChange={handleChange}
                  placeholder="Ingrese el nombre del colaborador"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={nuevoColaborador.email}
                  onChange={handleChange}
                  placeholder="Ingrese el email del colaborador"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Rol</Form.Label>
                <Form.Control
                  type="text"
                  name="rol"
                  value={nuevoColaborador.rol}
                  onChange={handleChange}
                  placeholder="Ingrese el rol del colaborador"
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="success" style={{ fontWeight: 'bold' }} onClick={colaboradorSeleccionado ? handleActualizarColaborador : handleAgregarColaborador}>
              {colaboradorSeleccionado ? 'Actualizar' : 'Guardar'} 
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

export default Colaboradores;
