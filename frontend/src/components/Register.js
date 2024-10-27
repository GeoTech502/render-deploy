import React, { useState } from 'react';
import axios from 'axios';
import { Form, Button, Container, Row, Col, Card } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import logo from '../assets/logo2.jpg';

function Register() {
  const [user, setUser] = useState({ username: '', email: '', password: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };

  const validateForm = () => {
    const { username, email, password } = user;
    if (!username || !email || !password) {
      return false;
    }
    return true;
  };

  const register = () => {
    if (!validateForm()) {
      Swal.fire({
        title: 'Error',
        text: 'Por favor, completa todos los campos.',
        icon: 'warning',
        confirmButtonText: 'Aceptar',
      });
      return;
    }

    axios
      .post('http://localhost:5000/register', user)
      .then((res) => {
        if (res.status === 200 && res.data.message === "Usuario registrado con éxito") {
          Swal.fire({
            title: 'Registro exitoso',
            text: 'Usuario registrado con éxito!',
            icon: 'success',
            confirmButtonText: 'Aceptar',
          }).then(() => {
            navigate('/login');
          });
        } else {
          Swal.fire({
            title: 'Error',
            text: res.data.message || 'Hubo un problema en el registro.',
            icon: 'error',
            confirmButtonText: 'Aceptar',
          });
        }
      })
      .catch((error) => {
        console.error(error);
        Swal.fire({
          title: 'Error en el registro',
          text: 'Usuario ya existente, favor ingresar datos diferentes.',
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
      });
  };

  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
      <Row>
        <Col>
          <Card style={{ padding: '20px', width: '400px', boxShadow: '0px 0px 15px rgba(0, 0, 0, 0.2)' }}>
            <div className="text-center">
              <img src={logo} alt="Logo" style={{ width: '150px', marginBottom: '20px', borderRadius: '15px' }} />
            </div>
            <h3 class="texto">REGISTRO</h3>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Nombre de usuario:</Form.Label>
                <Form.Control
                  type="text"
                  name="username"
                  value={user.username}
                  onChange={handleChange}
                  placeholder="Ingrese usuario"
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Correo electrónico:</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={user.email}
                  onChange={handleChange}
                  placeholder="Ingrese su correo"
                  required 
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Contraseña:</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  value={user.password}
                  onChange={handleChange}
                  placeholder="Ingrese la contraseña"
                  required 
                />
              </Form.Group>
              <Button variant="primary" onClick={register} style={{ width: '100%' }}>
                Registrar
              </Button>
              <div className="text-center mt-3">
                <Link to="/login" style={{ textDecoration: 'none', color: '#007bff' }}>
                  ¿Ya tienes cuenta? <strong>Inicia sesión</strong>
                </Link>
              </div>
            </Form>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Register;
