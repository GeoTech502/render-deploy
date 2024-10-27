import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Row, Col, Table, ButtonGroup, Button, Modal, Form } from 'react-bootstrap';
import { FaTrash, FaPen } from 'react-icons/fa';
import Swal from 'sweetalert2';
import Sidebar from './Sidebar';
import '../Dashboard.css';
import '../estilos.css';

function Defectos() {
  const [showModal, setShowModal] = useState(false);
  const [defectos, setDefectos] = useState([]);
  const [nuevoDefecto, setNuevoDefecto] = useState({
    nombre_defecto: '',
    descripcion: '',
    severidad: '',
    fecha_creacion: '',
    fecha_resolucion: '',
    estado: ''
  });

  useEffect(() => {
    axios.get('http://localhost:5000/defectos')
      .then(response => {
        const defectosConFechasFormateadas = response.data.map(defecto => ({
          ...defecto,
          fecha_creacion: new Date(defecto.fecha_creacion).toLocaleDateString('es-ES'),
          fecha_resolucion: defecto.fecha_resolucion ? new Date(defecto.fecha_resolucion).toLocaleDateString('es-ES') : ''
        }));
        setDefectos(defectosConFechasFormateadas);
      })
      .catch(error => {
        console.log('Error al obtener los defectos:', error);
      });
  }, []);

  const handleShowModal = () => setShowModal(true);
  const handleCloseModal = () => {
    setShowModal(false);
    setNuevoDefecto({
      nombre_defecto: '',
      descripcion: '',
      severidad: '',
      fecha_creacion: '',
      fecha_resolucion: '',
      estado: ''
    });
    setDefectoSeleccionado(null);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNuevoDefecto((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAgregarDefecto = () => {
    axios.post('http://localhost:5000/defectos', nuevoDefecto)
      .then(response => {
        const { id_defecto } = response.data;
        const defectoConId = { ...nuevoDefecto, id_defecto };
        setDefectos([...defectos, defectoConId]);
        handleCloseModal();

        Swal.fire({
          title: 'Éxito!',
          text: 'Defecto agregado correctamente!',
          icon: 'success',
          confirmButtonText: 'Aceptar'
        });
      })
      .catch(error => {
        console.error('Error al agregar el defecto:', error);
        Swal.fire({
          title: 'Error!',
          text: 'No se pudo agregar el defecto!',
          icon: 'error',
          confirmButtonText: 'Aceptar'
        });
      });
  };

  const [defectoSeleccionado, setDefectoSeleccionado] = useState(null);

  const handleShowUpdateModal = (defecto) => {
    setDefectoSeleccionado(defecto);
    setNuevoDefecto({
      nombre_defecto: defecto.nombre_defecto,
      descripcion: defecto.descripcion,
      severidad: defecto.severidad,
      fecha_creacion: defecto.fecha_creacion,
      fecha_resolucion: defecto.fecha_resolucion,
      estado: defecto.estado,
    });
    setShowModal(true);
  };

  const handleActualizarDefecto = () => {
    if (defectoSeleccionado) {
      axios.put(`http://localhost:5000/defectos/${defectoSeleccionado.id_defecto}`, nuevoDefecto)
        .then(response => {
          setDefectos(defectos.map(d => (d.id_defecto === defectoSeleccionado.id_defecto ? { ...d, ...nuevoDefecto } : d)));
          handleCloseModal();

          Swal.fire({
            title: 'Éxito!',
            text: 'Defecto actualizado correctamente!',
            icon: 'success',
            confirmButtonText: 'Aceptar'
          });
        })
        .catch(error => {
          console.error('Error al actualizar el defecto:', error);
          Swal.fire({
            title: 'Error!',
            text: 'No se pudo actualizar el defecto!',
            icon: 'error',
            confirmButtonText: 'Aceptar'
          });
        });
    }
  };

  const handleEliminarDefecto = (id) => {
    Swal.fire({
      title: '¿Estás seguro?',
      text: 'Esta acción no se puede deshacer.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar!',
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        axios.delete(`http://localhost:5000/defectos/${id}`)
          .then(() => {
            setDefectos(defectos.filter(defecto => defecto.id_defecto !== id));

            Swal.fire({
              title: 'Eliminado!',
              text: 'El defecto ha sido eliminado.',
              icon: 'success',
              confirmButtonText: 'Aceptar'
            });
          })
          .catch(error => {
            console.log('Error al eliminar el defecto:', error);
            Swal.fire({
              title: 'Error!',
              text: 'No se pudo eliminar el defecto!',
              icon: 'error',
              confirmButtonText: 'Aceptar'
            });
          });
      }
    });
  };

  const [busqueda, setBusqueda] = useState('');

  const defectosFiltrados = defectos.filter(defecto =>
    defecto.nombre_defecto.toLowerCase().includes(busqueda.toLowerCase()) ||
    defecto.fecha_creacion.includes(busqueda) ||
    defecto.estado.toLowerCase().includes(busqueda)
  );

  return (
    <Row>
      <Col xs={2}>
        <Sidebar />
      </Col>
      <Col xs={10} className="p-4">
        <h1>CONTROL DE DEFECTOS</h1>

        <ButtonGroup className="mb-3">
          <Button variant="success" onClick={handleShowModal}>Añadir Defecto</Button>
        </ButtonGroup>

        <Form.Control
          type="text"
          placeholder="Buscar defecto..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          className="mb-3"
        />

        <div style={{ overflowX: 'auto', maxHeight: '490px' }}> 
        <Table className="table-custom" striped bordered hover>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre Defecto</th>
              <th>Descripción</th>
              <th>Severidad</th>
              <th>Fecha Creación</th>
              <th>Fecha Resolución</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
          {defectosFiltrados.length > 0 ? (
            defectosFiltrados.map((defecto) => (
              <tr key={defecto.id_defecto}>
                <td>{defecto.id_defecto}</td>
                <td>{defecto.nombre_defecto}</td>
                <td>{defecto.descripcion}</td>
                <td>{defecto.severidad}</td>
                <td>{defecto.fecha_creacion}</td>
                <td>{defecto.fecha_resolucion || 'Sin resolver'}</td>
                <td>{defecto.estado}</td>
                <td>
                  <Button variant="primary" onClick={() => handleShowUpdateModal(defecto)}>
                    <FaPen />
                  </Button>{' '}
                  <Button variant="danger" onClick={() => handleEliminarDefecto(defecto.id_defecto)}>
                    <FaTrash />
                  </Button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="8" className="text-center">No hay datos disponibles</td>
            </tr>
          )}
        </tbody>
        </Table>
        </div>

        <Modal show={showModal} onHide={handleCloseModal}>
          <Modal.Header closeButton>
            <Modal.Title>{defectoSeleccionado ? 'Actualizar defecto' : 'Agregar defecto'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Nombre Defecto</Form.Label>
                <Form.Control
                  type="text"
                  name="nombre_defecto"
                  value={nuevoDefecto.nombre_defecto}
                  onChange={handleChange}
                  placeholder="Nombre del defecto"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Descripción</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="descripcion"
                  value={nuevoDefecto.descripcion}
                  onChange={handleChange}
                  placeholder="Descripción del defecto"
                  style={{ resize: 'none' }}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Severidad</Form.Label>
                <Form.Select
                    name="severidad"
                    value={nuevoDefecto.severidad}
                    onChange={handleChange}
                >
                    <option value="">Selecciona una severidad</option> {/* Opción por defecto vacía */}
                    <option value="Baja">Baja</option>
                    <option value="Media">Media</option>
                    <option value="Alta">Alta</option>
                </Form.Select>
                </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Fecha de creación</Form.Label>
                <Form.Control
                  type="date"
                  name="fecha_creacion"
                  value={nuevoDefecto.fecha_creacion}
                  onChange={handleChange}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Fecha de resolución</Form.Label>
                <Form.Control
                  type="date"
                  name="fecha_resolucion"
                  value={nuevoDefecto.fecha_resolucion}
                  onChange={handleChange}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Estado</Form.Label>
                <Form.Control
                  type="text"
                  name="estado"
                  value={nuevoDefecto.estado}
                  onChange={handleChange}
                  placeholder="Estado del defecto"
                />
              </Form.Group>
            </Form>
          </Modal.Body>
          <Modal.Footer>
          <Button variant="success" onClick={defectoSeleccionado ? handleActualizarDefecto : handleAgregarDefecto}>
              {defectoSeleccionado ? 'Actualizar' : 'Agregar'}
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

export default Defectos;
