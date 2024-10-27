import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Row, Col, Table, ButtonGroup, Button, Modal, Form } from 'react-bootstrap';
import { FaTrash, FaPen } from 'react-icons/fa';
import Swal from 'sweetalert2';
import Sidebar from './Sidebar';
import '../Dashboard.css';
import '../estilos.css';

function CasoPruebas() {
  const [showModal, setShowModal] = useState(false);
  const [casosPruebas, setCasosPruebas] = useState([]);
  const [nuevoCasoPrueba, setNuevoCasoPrueba] = useState({
    nombre_caso: '',
    descripcion: '',
    resultado_esperado: '',
    id_plan: ''
  });
  const [planes, setPlanes] = useState([]);

  // Obtener casos de prueba
  useEffect(() => {
    axios.get('http://localhost:5000/casopruebas')
      .then(response => setCasosPruebas(response.data))
      .catch(error => console.log('Error al obtener los casos de prueba:', error));
  }, []);
  
  // Obtener planes
  useEffect(() => {
    axios.get('http://localhost:5000/planpruebas')
      .then(response => setPlanes(response.data))
      .catch(error => console.error('Error al obtener los planes:', error));
  }, []);

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => {
    setShowModal(false);
    setNuevoCasoPrueba({
      nombre_caso: '',
      descripcion: '',
      resultado_esperado: '',
      id_plan: ''
    });
    setCasoPruebaSeleccionado(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNuevoCasoPrueba((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const fetchCasoPruebas = () => {
    axios.get('http://localhost:5000/casopruebas')
      .then(response => setCasosPruebas(response.data))
      .catch(error => console.error('Error al obtener los caso de pruebas', error));
  };

  const handleAgregarCasoPrueba = () => {
    axios.post('http://localhost:5000/casopruebas', nuevoCasoPrueba)
      .then(response => {
        const { id_caso_prueba } = response.data;
        const casoPruebaConId = { ...nuevoCasoPrueba, id_caso_prueba };
        setCasosPruebas([...casosPruebas, casoPruebaConId]);
        fetchCasoPruebas(); 
        handleCloseModal();

        Swal.fire({
          title: 'Éxito!',
          text: 'Caso de prueba agregado correctamente!',
          icon: 'success',
          confirmButtonText: 'Aceptar'
        });
      })
      .catch(error => {
        console.error('Error al agregar el caso de prueba:', error);
        Swal.fire({
          title: 'Error!',
          text: 'No se pudo agregar el caso de prueba!',
          icon: 'error',
          confirmButtonText: 'Aceptar'
        });
      });
  };

  const [casoPruebaSeleccionado, setCasoPruebaSeleccionado] = useState(null);

  const handleShowUpdateModal = (casoPrueba) => {
    setCasoPruebaSeleccionado(casoPrueba);
    setNuevoCasoPrueba({
      nombre_caso: casoPrueba.nombre_caso,
      descripcion: casoPrueba.descripcion,
      resultado_esperado: casoPrueba.resultado_esperado,
      id_plan: casoPrueba.id_plan,
    });
    setShowModal(true);
  };

  const handleActualizarCasoPrueba = () => {
    if (casoPruebaSeleccionado) {
      axios.put(`http://localhost:5000/casopruebas/${casoPruebaSeleccionado.id_caso_prueba}`, nuevoCasoPrueba)
        .then(response => {
          setCasosPruebas(casosPruebas.map(c => (c.id_caso_prueba === casoPruebaSeleccionado.id_caso_prueba ? { ...c, ...nuevoCasoPrueba } : c)));
          fetchCasoPruebas(); 
          handleCloseModal();

          Swal.fire({
            title: 'Éxito!',
            text: 'Caso de prueba actualizado correctamente!',
            icon: 'success',
            confirmButtonText: 'Aceptar'
          });
        })
        .catch(error => {
          console.error('Error al actualizar el caso de prueba:', error);
          Swal.fire({
            title: 'Error!',
            text: 'No se pudo actualizar el caso de prueba!',
            icon: 'error',
            confirmButtonText: 'Aceptar'
          });
        });
    }
  };

  const handleEliminarCasoPrueba = (id_caso_prueba) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar!',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        axios.delete(`http://localhost:5000/casopruebas/${id_caso_prueba}`)
          .then(() => {
            setCasosPruebas(casosPruebas.filter(casoPrueba => casoPrueba.id_caso_prueba !== id_caso_prueba));

            Swal.fire({
              title: 'Eliminado!',
              text: 'El caso de prueba ha sido eliminado.',
              icon: 'success',
              confirmButtonText: 'Aceptar'
            });
          })
          .catch(error => {
            console.log('Error al eliminar el caso de prueba:', error);
            Swal.fire({
              title: 'Error!',
              text: 'No se pudo eliminar el caso de prueba!',
              icon: 'error',
              confirmButtonText: 'Aceptar'
            });
          });
      }
    });
  };

  const [busqueda, setBusqueda] = useState('');

  const casosPruebasFiltrados = casosPruebas.filter(casoPrueba =>
    casoPrueba.nombre_caso.toLowerCase().includes(busqueda.toLowerCase()) ||
    casoPrueba.descripcion.toLowerCase().includes(busqueda.toLowerCase()) ||
    casoPrueba.id_caso_prueba.toString().includes(busqueda)
  );

  return (
    <Row>
      <Col xs={2}>
        <Sidebar />
      </Col>
      <Col xs={10} className="p-4">
        <h1>CONTROL DE CASOS DE PRUEBA</h1>

        <ButtonGroup className="mb-3">
          <Button variant="success" onClick={handleShowModal}>Añadir Registro</Button>
        </ButtonGroup>

        {/* Input de búsqueda */}
        <Form.Control
          type="text"
          placeholder="Buscar caso de prueba..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="mb-3"
        />

        <div style={{ overflowX: 'auto', maxHeight: '490px' }}> 
        <Table className="table-custom" striped bordered hover>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre del Caso</th>
              <th>Descripción</th>
              <th>Resultado Esperado</th>
              <th>Plan</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
          {casosPruebasFiltrados.length > 0 ? (
            casosPruebasFiltrados.map((casoPrueba) => (
              <tr key={casoPrueba.id_caso_prueba}>
                <td>{casoPrueba.id_caso_prueba}</td>
                <td>{casoPrueba.nombre_caso}</td>
                <td>{casoPrueba.descripcion}</td>
                <td>{casoPrueba.resultado_esperado}</td>
                <td>{casoPrueba.nombre_plan}</td>
                <td>
                  <Button variant="primary" onClick={() => handleShowUpdateModal(casoPrueba)}>
                    <FaPen />
                  </Button>{' '}
                  <Button variant="danger" onClick={() => handleEliminarCasoPrueba(casoPrueba.id_caso_prueba)}>
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
            <Modal.Title>{casoPruebaSeleccionado ? 'Actualizar caso de prueba' : 'Agregar caso de prueba'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Nombre del caso</Form.Label>
                <Form.Control
                  type="text"
                  name="nombre_caso"
                  value={nuevoCasoPrueba.nombre_caso}
                  onChange={handleChange}
                  placeholder="Ingrese el nombre del caso"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Descripción</Form.Label>
                <Form.Control
                  as="textarea"
                  name="descripcion"
                  value={nuevoCasoPrueba.descripcion}
                  onChange={handleChange}
                  placeholder="Ingrese una descripción"
                  rows={3}
                  style={{ resize: 'none' }}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Resultado esperado</Form.Label>
                <Form.Control
                  type="text"
                  name="resultado_esperado"
                  value={nuevoCasoPrueba.resultado_esperado}
                  onChange={handleChange}
                  placeholder="Ingrese el resultado esperado"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Plan de prueba</Form.Label>
                <Form.Select name="id_plan" value={nuevoCasoPrueba.id_plan} onChange={handleChange}>
                  <option value="">Seleccione un plan</option>
                  {planes.map(plan => (
                    <option key={plan.id_plan} value={plan.id_plan}>
                      {plan.nombre_plan}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
          <Button variant="success" style={{ fontWeight: 'bold' }} onClick={casoPruebaSeleccionado ? handleActualizarCasoPrueba : handleAgregarCasoPrueba}>
              {casoPruebaSeleccionado ? 'Actualizar' : 'Guardar'}
            </Button>
            <Button variant="danger" onClick={handleCloseModal}>Cerrar</Button>
          </Modal.Footer>
        </Modal>
      </Col>
    </Row>
  );
}

export default CasoPruebas;
