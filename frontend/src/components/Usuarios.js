import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Row, Col, Table, Button, Modal, Form } from 'react-bootstrap';
import { FaTrash, FaPen } from 'react-icons/fa';
import Swal from 'sweetalert2';
import Sidebar from './Sidebar';
import '../Dashboard.css';
import '../estilos.css';

function Usuarios() {
  const [showModal, setShowModal] = useState(false);
  const [usuarios, setUsuarios] = useState([]);
  const [nuevoUsuario, setNuevoUsuario] = useState({
    username: '',
    email: '',
    password: '',
    created_at: ''
  });

  useEffect(() => {
    axios.get('http://localhost:5000/users')
      .then(response => {
        const usuariosConFechasFormateadas = response.data.map(usuario => ({
          ...usuario,
          created_at: new Date(usuario.created_at).toLocaleDateString('es-ES')
        }));
        setUsuarios(usuariosConFechasFormateadas);
      })
      .catch(error => {
        console.log('Error al obtener los usuarios:', error);
      });
  }, []);


  const handleCloseModal = () => {
    setShowModal(false);
    setNuevoUsuario({
      username: '',
      email: '',
      password: '',
      created_at: ''
    });
    setUsuarioSeleccionado(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNuevoUsuario((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAgregarUsuario = () => {
    axios.post('http://localhost:5000/users', nuevoUsuario)
      .then(response => {
        const { id } = response.data;
        const usuarioConId = { ...nuevoUsuario, id };
        setUsuarios([...usuarios, usuarioConId]);
        handleCloseModal();

        Swal.fire({
          title: 'Éxito!',
          text: 'Usuario agregado correctamente!',
          icon: 'success',
          confirmButtonText: 'Aceptar'
        });
      })
      .catch(error => {
        console.error('Error al agregar el usuario:', error);
        Swal.fire({
          title: 'Error!',
          text: 'No se pudo agregar el usuario!',
          icon: 'error',
          confirmButtonText: 'Aceptar'
        });
      });
  };

  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);

  const handleShowUpdateModal = (usuario) => {
    setUsuarioSeleccionado(usuario);
    setNuevoUsuario({
      username: usuario.username,
      email: usuario.email,
      password: usuario.password,
      created_at: usuario.created_at
    });
    setShowModal(true);
  };

  const handleActualizarUsuario = () => {
    if (usuarioSeleccionado) {
      axios.put(`http://localhost:5000/users/${usuarioSeleccionado.id}`, nuevoUsuario)
        .then(response => {
          setUsuarios(usuarios.map(u => (u.id === usuarioSeleccionado.id ? { ...u, ...nuevoUsuario } : u)));
          handleCloseModal();

          Swal.fire({
            title: 'Éxito!',
            text: 'Usuario actualizado correctamente!',
            icon: 'success',
            confirmButtonText: 'Aceptar'
          });
        })
        .catch(error => {
          console.error('Error al actualizar el usuario:', error);
          Swal.fire({
            title: 'Error!',
            text: 'No se pudo actualizar el usuario!',
            icon: 'error',
            confirmButtonText: 'Aceptar'
          });
        });
    }
  };

  const handleEliminarUsuario = (id) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar!',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        axios.delete(`http://localhost:5000/users/${id}`)
          .then(() => {
            setUsuarios(usuarios.filter(usuario => usuario.id !== id));

            Swal.fire({
              title: 'Eliminado!',
              text: 'El usuario ha sido eliminado.',
              icon: 'success',
              confirmButtonText: 'Aceptar'
            });
          })
          .catch(error => {
            console.log('Error al eliminar el usuario:', error);
            Swal.fire({
              title: 'Error!',
              text: 'No se pudo eliminar el usuario!',
              icon: 'error',
              confirmButtonText: 'Aceptar'
            });
          });
      }
    });
  };

  const [busqueda, setBusqueda] = useState('');

  const usuariosFiltrados = usuarios.filter(usuario =>
    usuario.username.toLowerCase().includes(busqueda.toLowerCase()) ||
    usuario.email.toLowerCase().includes(busqueda) ||
    usuario.created_at.includes(busqueda)
  );

  return (
    <Row>
      <Col xs={2}>
        <Sidebar />
      </Col>
      <Col xs={10} className="p-4">
        <h1>GESTIÓN DE USUARIOS</h1>

        <Form.Control
          type="text"
          placeholder="Buscar usuario..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="mb-3"
        />

        <div style={{ overflowX: 'auto', maxHeight: '600px' }}>
        <Table className="table-custom" striped bordered hover>
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Email</th>
              <th>Fecha Creación</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
          {usuariosFiltrados.length > 0 ? (
            usuariosFiltrados.map((usuario) => (
              <tr key={usuario.id}>
                <td>{usuario.id}</td>
                <td>{usuario.username}</td>
                <td>{usuario.email}</td>
                <td>{usuario.created_at}</td>
                <td>
                  <Button variant="primary" onClick={() => handleShowUpdateModal(usuario)}>
                    <FaPen />
                  </Button>{' '}
                  <Button variant="danger" onClick={() => handleEliminarUsuario(usuario.id)}>
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
            <Modal.Title>{usuarioSeleccionado ? 'Actualizar usuario' : 'Agregar usuario'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Username</Form.Label>
                <Form.Control
                  type="text"
                  name="username"
                  value={nuevoUsuario.username}
                  onChange={handleChange}
                  placeholder="Nombre de usuario"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={nuevoUsuario.email}
                  onChange={handleChange}
                  placeholder="Correo electrónico"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  value={nuevoUsuario.password}
                  onChange={handleChange}
                  placeholder="Contraseña"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Fecha de creación</Form.Label>
                <Form.Control
                  type="date"
                  name="created_at"
                  value={nuevoUsuario.created_at}
                  onChange={handleChange}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="success" onClick={usuarioSeleccionado ? handleActualizarUsuario : handleAgregarUsuario}>
              {usuarioSeleccionado ? 'Actualizar' : 'Agregar'}
            </Button>
            <Button variant="danger" onClick={handleCloseModal}>
              Cancelar
            </Button>
          </Modal.Footer>
        </Modal>
      </Col>
    </Row>
  );
}

export default Usuarios;
