import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Row, Col, Table, ButtonGroup, Button, Modal, Form } from 'react-bootstrap';
import { FaTrash, FaPen } from 'react-icons/fa';
import Swal from 'sweetalert2';
import Sidebar from './Sidebar';
import '../Dashboard.css';
import '../estilos.css';

function EjecucionPruebas() {
  const [showModal, setShowModal] = useState(false);
  const [ejecucionesPruebas, setEjecucionesPruebas] = useState([]);
  const [nuevaEjecucionPrueba, setNuevaEjecucionPrueba] = useState({
    id_caso_prueba: '',
    fecha_ejecucion: '',
    resultado: '',
    evidencia: ''
  });
  const [casosPruebas, setCasosPruebas] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:5000/ejecucionpruebas')
      .then(response => {
        const ejecucionPruebasConFechasFormateadas = response.data.map(ejecucionPrueba => ({
          ...ejecucionPrueba,
          fecha_ejecucion: new Date(ejecucionPrueba.fecha_ejecucion).toLocaleDateString('es-ES'), 
          nombre_caso: ejecucionPrueba.nombre_caso 
        }));
        setEjecucionesPruebas(ejecucionPruebasConFechasFormateadas); 
      })
      .catch(error => {
        console.log('Error al obtener las ejecuciones de prueba:', error);
      });
  }, []);
  

  // Obtener casos de prueba
  useEffect(() => {
    axios.get('http://localhost:5000/casopruebas')
      .then(response => setCasosPruebas(response.data))
      .catch(error => console.error('Error al obtener los casos de prueba:', error));
  }, []);

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => {
    setShowModal(false);
    setNuevaEjecucionPrueba({
      id_caso_prueba: '',
      fecha_ejecucion: '',
      resultado: '',
      evidencia: ''
    });
    setEjecucionPruebaSeleccionada(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNuevaEjecucionPrueba((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const fetchEjecucionPrueba = () => {
    axios.get('http://localhost:5000/ejecucionpruebas')
      .then(response => setEjecucionesPruebas(response.data))
      .catch(error => console.error('Error al obtener las ejecuciones', error));
  };

  const handleAgregarEjecucionPrueba = () => {
    axios.post('http://localhost:5000/ejecucionpruebas', nuevaEjecucionPrueba)
      .then(response => {
        const { id_ejecucion } = response.data;
        const ejecucionPruebaConId = { ...nuevaEjecucionPrueba, id_ejecucion };
        setEjecucionesPruebas([...ejecucionesPruebas, ejecucionPruebaConId]);
        fetchEjecucionPrueba(); 
        handleCloseModal();

        Swal.fire({
          title: 'Éxito!',
          text: 'Ejecución de prueba agregada correctamente!',
          icon: 'success',
          confirmButtonText: 'Aceptar'
        });
      })
      .catch(error => {
        console.error('Error al agregar la ejecución de prueba:', error);
        Swal.fire({
          title: 'Error!',
          text: 'No se pudo agregar la ejecución de prueba!',
          icon: 'error',
          confirmButtonText: 'Aceptar'
        });
      });
  };

  const [ejecucionPruebaSeleccionada, setEjecucionPruebaSeleccionada] = useState(null);

  const handleShowUpdateModal = (ejecucionPrueba) => {
    setEjecucionPruebaSeleccionada(ejecucionPrueba);
    setNuevaEjecucionPrueba({
      id_caso_prueba: ejecucionPrueba.id_caso_prueba,
      fecha_ejecucion: ejecucionPrueba.fecha_ejecucion,
      resultado: ejecucionPrueba.resultado,
      evidencia: ejecucionPrueba.evidencia,
    });
    setShowModal(true);
  };

  const handleActualizarEjecucionPrueba = () => {
    if (ejecucionPruebaSeleccionada) {
      axios.put(`http://localhost:5000/ejecucionpruebas/${ejecucionPruebaSeleccionada.id_ejecucion}`, nuevaEjecucionPrueba)
        .then(response => {
          setEjecucionesPruebas(ejecucionesPruebas.map(e => (e.id_ejecucion === ejecucionPruebaSeleccionada.id_ejecucion ? { ...e, ...nuevaEjecucionPrueba } : e)));
          fetchEjecucionPrueba();
          handleCloseModal();

          Swal.fire({
            title: 'Éxito!',
            text: 'Ejecución de prueba actualizada correctamente!',
            icon: 'success',
            confirmButtonText: 'Aceptar'
          });
        })
        .catch(error => {
          console.error('Error al actualizar la ejecución de prueba:', error);
          Swal.fire({
            title: 'Error!',
            text: 'No se pudo actualizar la ejecución de prueba!',
            icon: 'error',
            confirmButtonText: 'Aceptar'
          });
        });
    }
  };

  const handleEliminarEjecucionPrueba = (id) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar!',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        axios.delete(`http://localhost:5000/ejecucionpruebas/${id}`)
          .then(() => {
            setEjecucionesPruebas(ejecucionesPruebas.filter(ejecucionPrueba => ejecucionPrueba.id_ejecucion !== id));

            Swal.fire({
              title: 'Eliminado!',
              text: 'La ejecución de prueba ha sido eliminada.',
              icon: 'success',
              confirmButtonText: 'Aceptar'
            });
          })
          .catch(error => {
            console.log('Error al eliminar la ejecución de prueba:', error);
            Swal.fire({
              title: 'Error!',
              text: 'No se pudo eliminar la ejecución de prueba!',
              icon: 'error',
              confirmButtonText: 'Aceptar'
            });
          });
      }
    });
  };

  const [busqueda, setBusqueda] = useState('');

  const ejecucionesPruebasFiltradas = ejecucionesPruebas.filter(ejecucionPrueba =>
    ejecucionPrueba.resultado.toLowerCase().includes(busqueda.toLowerCase()) ||
    ejecucionPrueba.fecha_ejecucion.includes(busqueda) ||
    ejecucionPrueba.id_ejecucion.toString().includes(busqueda)
  );

  return (
    <Row>
      <Col xs={2}>
        <Sidebar />
      </Col>
      <Col xs={10} className="p-4">
        <h1>CONTROL DE EJECUCIONES DE PRUEBA</h1>

        <ButtonGroup className="mb-3">
          <Button variant="success" onClick={handleShowModal}>Añadir Registro</Button>
        </ButtonGroup>

        {/* Input de búsqueda */}
        <Form.Control
          type="text"
          placeholder="Buscar ejecución de prueba..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="mb-3"
        />

        <div style={{ overflowX: 'auto', maxHeight: '530px' }}> 
        <Table className="table-custom" striped bordered hover>
          <thead>
            <tr>
              <th>ID</th>
              <th>Caso de Prueba</th>
              <th>Fecha de Ejecución</th>
              <th>Resultado</th>
              <th>Evidencia</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
          {ejecucionesPruebasFiltradas.length > 0 ? (
            ejecucionesPruebasFiltradas.map((ejecucionPrueba) => (
              <tr key={ejecucionPrueba.id_ejecucion}>
                <td>{ejecucionPrueba.id_ejecucion}</td>
                <td>{ejecucionPrueba.nombre_caso}</td>
                <td>{ejecucionPrueba.fecha_ejecucion}</td>
                <td>{ejecucionPrueba.resultado}</td>
                <td>{ejecucionPrueba.evidencia}</td>
                <td>
                  <Button variant="primary" onClick={() => handleShowUpdateModal(ejecucionPrueba)}>
                    <FaPen />
                  </Button>{' '}
                  <Button variant="danger" onClick={() => handleEliminarEjecucionPrueba(ejecucionPrueba.id_ejecucion)}>
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
            <Modal.Title>{ejecucionPruebaSeleccionada ? 'Actualizar ejecución de prueba' : 'Agregar ejecución de prueba'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Caso de Prueba</Form.Label>
                <Form.Select name="id_caso_prueba" value={nuevaEjecucionPrueba.id_caso_prueba} onChange={handleChange}>
                  <option value="">Seleccionar caso de prueba</option>
                  {casosPruebas.map(casoPrueba => (
                    <option key={casoPrueba.id_caso_prueba} value={casoPrueba.id_caso_prueba}>{casoPrueba.nombre_caso}</option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Fecha de Ejecución</Form.Label>
                <Form.Control
                  type="date"
                  name="fecha_ejecucion"
                  value={nuevaEjecucionPrueba.fecha_ejecucion}
                  onChange={handleChange}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Resultado</Form.Label>
                <Form.Control
                  type="text"
                  name="resultado"
                  value={nuevaEjecucionPrueba.resultado}
                  onChange={handleChange}
                  placeholder="Ingresa el resultado"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Evidencia</Form.Label>
                <Form.Control
                  type="text"
                  name="evidencia"
                  value={nuevaEjecucionPrueba.evidencia}
                  onChange={handleChange}
                  placeholder="Ingresa la evidencia"
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
          <Button
              variant="success"
              onClick={ejecucionPruebaSeleccionada ? handleActualizarEjecucionPrueba : handleAgregarEjecucionPrueba}
              style={{ fontWeight: 'bold' }} 
            >
              {ejecucionPruebaSeleccionada ? 'Actualizar' : 'Guardar'}
            </Button>
            <Button variant="danger" style={{ fontWeight: 'bold' }}  onClick={handleCloseModal}>
              Cerrar
            </Button>
          </Modal.Footer>
        </Modal>
      </Col>
    </Row>
  );
}

export default EjecucionPruebas;
