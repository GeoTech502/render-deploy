import React, { useState } from 'react';
import axios from 'axios';
import { Form, Button, Container, Row, Col, Card } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { jwtDecode } from 'jwt-decode';
import logo from '../assets/logo2.jpg';
import '../index.css';


function Login() {
  const [user, setUser] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
  };

  const login = () => {
    axios
      .post('http://localhost:5000/login', user)
      .then((res) => {
        if (res.data.token) {
          localStorage.setItem('token', res.data.token);

          // Decodificar el token y guardar el nombre de usuario en el localStorage
          const decodedToken = jwtDecode(res.data.token);
          localStorage.setItem('username', decodedToken.username);

          Swal.fire({
            title: 'Bienvenido',
            text: 'Inicio de sesión exitoso',
            icon: 'success',
            confirmButtonText: 'Aceptar',
          }).then(() => {
            navigate('/dashboard');
          });
        } else {
          Swal.fire({
            title: 'Error',
            text: 'Correo o contraseña incorrectos',
            icon: 'error',
            confirmButtonText: 'Intentar de nuevo',
          });
        }
      })
      .catch(() => {
        Swal.fire({
          title: 'Error',
          text: 'Usuario o contraseña incorrecto, intente de nuevo!',
          icon: 'error',
          confirmButtonText: 'Aceptar',
        });
      });
  };
  
  return (
    <Container className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
      <Row>
        <Col>
          <Card style={{ padding: '20px', width: '400px', boxShadow: '0px 0px 15px rgba(0, 0, 0, 0.2)', borderRadius: '25px' }} >
            {/* Logo centrado arriba del formulario */}
            <div className="text-center">
              <img src={logo} alt="Logo" style={{ width: '150px', marginBottom: '20px', borderRadius: '15px' }} />
            </div>
            <h3 class="texto">INICIO DE SESIÓN</h3>
            <Form>
              <Form.Group className="mb-3">
                <Form.Label>Correo electrónico:</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  value={user.email}
                  onChange={handleChange}
                  placeholder="Ingrese correo"
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
                />
              </Form.Group>
              <Button variant="success" onClick={login} style={{ width: '100%', borderRadius: '25px' }}>
                Ingresar
              </Button>
              <div className="text-center mt-3">
                <Link to="/register" style={{ textDecoration: 'none', color: '#007bff' }}>
                  ¿No tienes cuenta? <strong>Registrarse</strong>
                </Link>
              </div>
            </Form>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

export default Login;
