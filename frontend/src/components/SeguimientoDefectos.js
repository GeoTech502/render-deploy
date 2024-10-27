import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Row, Col, Table, ButtonGroup, Button, Modal, Form } from 'react-bootstrap';

import Swal from 'sweetalert2';
import Sidebar from './Sidebar';
import '../Dashboard.css';
import '../estilos.css';

function SeguimientoDefectos() {
  const [showModal, setShowModal] = useState(false);
  const [seguimientoDefectos, setSeguimientoDefectos] = useState([]);
  const [nuevaAsignacion, setNuevaAsignacion] = useState({
    id_ejecucion: '',
    id_defecto: ''
  });
  const [ejecuciones, setEjecuciones] = useState([]);
  const [defectos, setDefectos] = useState([]);

  // Obtener datos de ejecuciones de prueba y defectos
  useEffect(() => {
    axios.get('http://localhost:5000/seguimientodefectos')
      .then(response => setSeguimientoDefectos(response.data))
      .catch(error => console.error('Error al obtener los detalles de defectos:', error));
  }, []);

  useEffect(() => {
    axios.get('http://localhost:5000/ejecucionpruebas')
      .then(response => {
        setEjecuciones(response.data);
      })
      .catch(error => console.error('Error al obtener las ejecuciones de prueba:', error));
      
    axios.get('http://localhost:5000/defectos')
      .then(response => setDefectos(response.data))
      .catch(error => console.error('Error al obtener los defectos:', error));
  }, []);
  

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => {
    setShowModal(false);
    setNuevaAsignacion({
      id_ejecucion: '',
      id_defecto: ''
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

  const fetchSeguimientoDefectos = () => {
    axios.get('http://localhost:5000/seguimientodefectos')
      .then(response => setSeguimientoDefectos(response.data))
      .catch(error => console.error('Error al obtener los detalles de defectos:', error));
};

  const handleAgregarAsignacion = () => {
    axios.post('http://localhost:5000/seguimientodefectos', nuevaAsignacion)
      .then(response => {
        const { id_ejecucion, id_defecto } = nuevaAsignacion;
        const asignacionConId = { id_ejecucion, id_defecto }; // Si el servidor responde con algún ID, úsalo aquí
        setSeguimientoDefectos([...seguimientoDefectos, asignacionConId]);
        fetchSeguimientoDefectos();
        handleCloseModal();

        Swal.fire({
          title: 'Éxito!',
          text: 'Asignación de defecto agregada correctamente!',
          icon: 'success',
          confirmButtonText: 'Aceptar'
        });
      })
      .catch(error => {
        console.error('Error al agregar la asignación de defecto:', error);
        Swal.fire({
          title: 'Error!',
          text: 'No se pudo agregar la asignación de defecto!',
          icon: 'error',
          confirmButtonText: 'Aceptar'
        });
      });
  };

  const [asignacionSeleccionada, setAsignacionSeleccionada] = useState(null);

  const [busqueda, setBusqueda] = useState('');

  const seguimientoDefectosFiltrados = seguimientoDefectos.filter(asignacion =>
    asignacion.id_ejecucion.toString().includes(busqueda) ||
    asignacion.id_defecto.toString().includes(busqueda)
  );

  return (
    <Row>
      <Col xs={2}>
        <Sidebar />
      </Col>
      <Col xs={10} className="p-4">
        <h1>SEGUIMIENTO DE DEFECTOS</h1>

        <ButtonGroup className="mb-3">
          <Button variant="success" onClick={handleShowModal}>Añadir Registro</Button>
        </ButtonGroup>

        {/* Input de búsqueda */}
        <Form.Control
          type="text"
          placeholder="Buscar asignación de defecto..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="mb-3"
        />

        <div style={{ overflowX: 'auto', maxHeight: '490px' }}> 
        <Table className="table-custom" striped bordered hover>
          <thead>
            <tr>
              <th>ID Ejecución</th>
              <th>ID Defecto</th>
            </tr>
          </thead>
          <tbody>
          {seguimientoDefectosFiltrados.length > 0 ? (
            seguimientoDefectosFiltrados.map((asignacion) => (
              <tr key={asignacion.id_ejecucion}> {/* Cambia 'id' si es necesario */}
                <td>{asignacion.id_ejecucion}</td>
                <td>{asignacion.nombre_defecto}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="3" className="text-center">No hay datos disponibles</td>
            </tr>
          )}
        </tbody>
        </Table>
        </div>

        <Modal show={showModal} onHide={handleCloseModal}>
          <Modal.Header closeButton>
            <Modal.Title>{asignacionSeleccionada ? 'Actualizar asignación de defecto' : 'Agregar asignación de defecto'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>ID Ejecución</Form.Label>
                <Form.Select name="id_ejecucion" value={nuevaAsignacion.id_ejecucion} onChange={handleChange}>
                  <option value="">Seleccionar ejecución</option>
                  {ejecuciones.map(ejecucion => (
                    <option key={ejecucion.id_ejecucion} value={ejecucion.id_ejecucion}>{ejecucion.id_ejecucion}</option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>ID Defecto</Form.Label>
                <Form.Select name="id_defecto" value={nuevaAsignacion.id_defecto} onChange={handleChange}>
                  <option value="">Seleccionar defecto</option>
                  {defectos.map(defecto => (
                    <option key={defecto.id_defecto} value={defecto.id_defecto}>{defecto.nombre_defecto}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="success"
              onClick={handleAgregarAsignacion}
              style={{ fontWeight: 'bold' }} 
            >
              {'Guardar'}
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

export default SeguimientoDefectos;
