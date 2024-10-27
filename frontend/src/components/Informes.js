import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Row, Col, Table, ButtonGroup, Button, Modal, Form } from 'react-bootstrap';
import { FaTrash, FaPen } from 'react-icons/fa';
import Swal from 'sweetalert2';
import Sidebar from './Sidebar';
import '../Dashboard.css';
import '../estilos.css';

function Informes() {
  const [showModal, setShowModal] = useState(false);
  const [informes, setInformes] = useState([]);
  const [nuevoInforme, setNuevoInforme] = useState({
    id_proyecto: '',
    nombre_informe: '',
    descripcion: '',
    fecha_creacion: ''
  });
  const [proyectos, setProyectos] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/informes')
      .then(response => {
        const informesConFechasFormateadas = response.data.map(informe => ({
          ...informe,
          fecha_creacion: new Date(informe.fecha_creacion).toLocaleDateString('es-ES'),
        }));
        setInformes(informesConFechasFormateadas);
      })
      .catch(error => {
        console.log('Error al obtener los informes:', error);
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
    setNuevoInforme({
      id_proyecto: '',
      nombre_informe: '',
      descripcion: '',
      fecha_creacion: ''
    });
    setInformeSeleccionado(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNuevoInforme((prev) => ({
      ...prev,
      [name]: value
    }));
  };


  const fetchInformes = () => {
    axios.get('http://localhost:5000/informes')
      .then(response => setInformes(response.data))
      .catch(error => console.error('Error al obtener los informes', error));
  };
  

  const handleAgregarInforme = () => {
    axios.post('http://localhost:5000/informes', nuevoInforme)
      .then(response => {
        const { id_informe } = response.data;
        const informeConId = { ...nuevoInforme, id_informe };
        setInformes([...informes, informeConId]);
        fetchInformes();
        handleCloseModal();
        
        Swal.fire({
          title: 'Éxito!',
          text: 'Informe agregado correctamente!',
          icon: 'success',
          confirmButtonText: 'Aceptar'
        });
      })
      .catch(error => {
        console.error('Error al agregar el informe:', error);
        Swal.fire({
          title: 'Error!',
          text: 'No se pudo agregar el informe!',
          icon: 'error',
          confirmButtonText: 'Aceptar'
        });
      });
  };

  const [informeSeleccionado, setInformeSeleccionado] = useState(null);

  const handleShowUpdateModal = (informe) => {
    setInformeSeleccionado(informe);
    setNuevoInforme({
      id_proyecto: informe.id_proyecto,
      nombre_informe: informe.nombre_informe,
      descripcion: informe.descripcion,
      fecha_creacion: informe.fecha_creacion,
    });
    setShowModal(true);
  };

  const handleActualizarInforme = () => {
    if (informeSeleccionado) {
      axios.put(`http://localhost:5000/informes/${informeSeleccionado.id_informe}`, nuevoInforme)
        .then(response => {
          setInformes(informes.map(i => (i.id_informe === informeSeleccionado.id_informe ? { ...i, ...nuevoInforme } : i)));
          fetchInformes();
          handleCloseModal();

          Swal.fire({
            title: 'Éxito!',
            text: 'Informe actualizado correctamente!',
            icon: 'success',
            confirmButtonText: 'Aceptar'
          });
        })
        .catch(error => {
          console.error('Error al actualizar el informe:', error);
          Swal.fire({
            title: 'Error!',
            text: 'No se pudo actualizar el informe!',
            icon: 'error',
            confirmButtonText: 'Aceptar'
          });
        });
    }
  };

  const handleEliminarInforme = (id) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar!',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        axios.delete(`http://localhost:5000/informes/${id}`)
          .then(() => {
            setInformes(informes.filter(informe => informe.id_informe !== id));

            Swal.fire({
              title: 'Eliminado!',
              text: 'El informe ha sido eliminado.',
              icon: 'success',
              confirmButtonText: 'Aceptar'
            });
          })
          .catch(error => {
            console.log('Error al eliminar el informe:', error);
            Swal.fire({
              title: 'Error!',
              text: 'No se pudo eliminar el informe!',
              icon: 'error',
              confirmButtonText: 'Aceptar'
            });
          });
      }
    });
  };

  const [busqueda, setBusqueda] = useState('');

  const informesFiltrados = informes.filter(informe =>
    informe.nombre_informe.toLowerCase().includes(busqueda.toLowerCase()) ||
    informe.fecha_creacion.includes(busqueda) ||
    informe.id_informe.toString().includes(busqueda)
  );

  return (
    <Row>
      <Col xs={2}>
        <Sidebar />
      </Col>
      <Col xs={10} className="p-4">
        <h1>CONTROL DE INFORMES</h1>

        <ButtonGroup className="mb-3">
          <Button variant="success" onClick={handleShowModal}>Añadir Registro</Button>
        </ButtonGroup>

        {/* Input de búsqueda */}
        <Form.Control
          type="text"
          placeholder="Buscar informe..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="mb-3"
        />

        <div style={{ overflowX: 'auto', maxHeight: '530px' }}>
          <Table className="table-custom" striped bordered hover>
            <thead>
              <tr>
                <th>ID</th>
                <th>Proyecto</th>
                <th>Nombre del Informe</th>
                <th>Descripción</th>
                <th>Fecha de Creación</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {informesFiltrados.length > 0 ? (
                informesFiltrados.map((informe) => (
                  <tr key={informe.id_informe}>
                    <td>{informe.id_informe}</td>
                    <td>{informe.nombre_proyecto}</td>
                    <td>{informe.nombre_informe}</td>
                    <td>{informe.descripcion}</td>
                    <td>{informe.fecha_creacion}</td>
                    <td>
                      <Button variant="primary" onClick={() => handleShowUpdateModal(informe)}>
                        <FaPen />
                      </Button>{' '}
                      <Button variant="danger" onClick={() => handleEliminarInforme(informe.id_informe)}>
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
            <Modal.Title>{informeSeleccionado ? 'Actualizar informe' : 'Agregar informe'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Proyecto</Form.Label>
                <Form.Select name="id_proyecto" value={nuevoInforme.id_proyecto} onChange={handleChange}>
                <option value="">Seleccionar proyecto</option>
                {proyectos.map(proyecto => (
                  <option key={proyecto.id_proyecto} value={proyecto.id_proyecto}>
                    {proyecto.id_proyecto}
                  </option>
                ))}
              </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Nombre del Informe</Form.Label>
                <Form.Control
                  type="text"
                  name="nombre_informe"
                  value={nuevoInforme.nombre_informe}
                  onChange={handleChange}
                  placeholder="Ingresa el nombre del informe"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Descripción</Form.Label>
                <Form.Control
                  type="text"
                  name="descripcion"
                  value={nuevoInforme.descripcion}
                  onChange={handleChange}
                  placeholder="Ingresa la descripción"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Fecha de Creación</Form.Label>
                <Form.Control
                  type="date"
                  name="fecha_creacion"
                  value={nuevoInforme.fecha_creacion}
                  onChange={handleChange}
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="success"
              onClick={informeSeleccionado ? handleActualizarInforme : handleAgregarInforme}
              style={{ fontWeight: 'bold' }}
            >
              {informeSeleccionado ? 'Actualizar' : 'Guardar'}
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

export default Informes;
