const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'test-master',
});

db.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL database.');
});

// Registro de usuario
app.post('/register', (req, res) => {
  const { username, email, password } = req.body;
  const salt = bcrypt.genSaltSync(10);
  const hashedPassword = bcrypt.hashSync(password, salt);

  db.query(
    'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
    [username, email, hashedPassword],
    (err, result) => {
      if (err) {
        res.status(500).send({ message: 'Error en el registro' });
      } else {
        res.send({ message: 'Usuario registrado con éxito' });
      }
    }
  );
});

// Inicio de sesión
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  db.query('SELECT * FROM users WHERE email = ?', [email], (err, result) => {
    if (err) {
      res.status(500).send({ message: 'Error en la autenticación' });
    } else if (result.length > 0) {
      const user = result[0];
      const isPasswordValid = bcrypt.compareSync(password, user.password);
      if (isPasswordValid) {
        const token = jwt.sign({ id: user.id, username: user.username }, 'secretkey');
        res.send({ 
          message: 'Inicio de sesión exitoso', 
          token,
          user: { username: user.username }  // Añadir el nombre de usuario
        });
      } else {
        res.status(401).send({ message: 'Contraseña incorrecta' });
      }
    } else {
      res.status(404).send({ message: 'Usuario no encontrado' });
    }
  });
});


app.listen(5000, () => {
  console.log('Server is running on port 5000');
});

////**********MODULO DE RECURSOS *************/////////////
// Obtener todos los recursos
app.get('/recursos', (req, res) => {
  db.query('SELECT * FROM recurso', (err, result) => {
    if (err) {
      res.status(500).send({ message: 'Error al obtener recursos' });
    } else {
      res.send(result);
    }
  });
});

// Crear un nuevo recurso
app.post('/recursos', (req, res) => {
  const { nombre_recurso, tipo_recurso, descripcion, disponibilidad } = req.body;

  db.query(
    'INSERT INTO recurso (nombre_recurso, tipo_recurso, descripcion, disponibilidad) VALUES (?, ?, ?, ?)',
    [nombre_recurso, tipo_recurso, descripcion, disponibilidad],
    (err, result) => {
      if (err) {
        res.status(500).send({ message: 'Error al crear recurso' });
      } else {
        res.send({ message: 'Recurso creado con éxito' });
      }
    }
  );
});

// Actualizar un recurso existente
app.put('/recursos/:id', (req, res) => {
  const { id } = req.params;
  const { nombre_recurso, tipo_recurso, descripcion, disponibilidad } = req.body;

  db.query(
    'UPDATE recurso SET nombre_recurso = ?, tipo_recurso = ?, descripcion = ?, disponibilidad = ? WHERE id_recurso = ?',
    [nombre_recurso, tipo_recurso, descripcion, disponibilidad, id],
    (err, result) => {
      if (err) {
        res.status(500).send({ message: 'Error al actualizar recurso' });
      } else {
        res.send({ message: 'Recurso actualizado con éxito' });
      }
    }
  );
});

// Eliminar un recurso
app.delete('/recursos/:id', (req, res) => {
  const { id } = req.params;

  db.query('DELETE FROM recurso WHERE id_recurso = ?', [id], (err, result) => {
    if (err) {
      res.status(500).send({ message: 'Error al eliminar recurso' });
    } else {
      res.send({ message: 'Recurso eliminado con éxito' });
    }
  });
});

// Obtener el total de recursos
app.get('/recursos/count', (req, res) => {
  db.query('SELECT COUNT(*) AS total FROM recurso', (err, result) => {
    if (err) {
      res.status(500).send({ message: 'Error al obtener el total de recursos' });
    } else {
      res.send({ total: result[0].total });
    }
  });
});

////***************MODULO DE COLABORADORES *************/////////////
// Obtener todos los colaboradores
app.get('/colaboradores', (req, res) => {
  db.query('SELECT * FROM colaborador', (err, result) => {
    if (err) {
      res.status(500).send({ message: 'Error al obtener colaboradores' });
    } else {
      res.send(result);
    }
  });
});

// Crear un nuevo colaborador
app.post('/colaboradores', (req, res) => {
  const { nombre, email, rol } = req.body;

  db.query(
    'INSERT INTO colaborador (nombre, email, rol) VALUES (?, ?, ?)',
    [nombre, email, rol],
    (err, result) => {
      if (err) {
        res.status(500).send({ message: 'Error al crear colaborador' });
      } else {
        res.send({ message: 'Colaborador creado con éxito', id_colaborador: result.insertId }); // Agregamos el ID en la respuesta
      }
    }
  );
});

// Actualizar un colaborador existente
app.put('/colaboradores/:id', (req, res) => {
  const { id } = req.params;
  const { nombre, email, rol } = req.body;

  db.query(
    'UPDATE colaborador SET nombre = ?, email = ?, rol = ? WHERE id_colaborador = ?',
    [nombre, email, rol, id],
    (err, result) => {
      if (err) {
        res.status(500).send({ message: 'Error al actualizar colaborador' });
      } else {
        res.send({ message: 'Colaborador actualizado con éxito' });
      }
    }
  );
});

// Eliminar un colaborador
app.delete('/colaboradores/:id', (req, res) => {
  const { id } = req.params;

  db.query('DELETE FROM colaborador WHERE id_colaborador = ?', [id], (err, result) => {
    if (err) {
      res.status(500).send({ message: 'Error al eliminar colaborador' });
    } else {
      res.send({ message: 'Colaborador eliminado con éxito' });
    }
  });
});

// Obtener el total de colaboradores
app.get('/colaboradores/count', (req, res) => {
  db.query('SELECT COUNT(*) AS total FROM colaborador', (err, result) => {
    if (err) {
      res.status(500).send({ message: 'Error al obtener el total de colaboradores' });
    } else {
      res.send({ total: result[0].total });
    }
  });
});

////***************MODULO DE PROYECTOS *************/////////////
// Obtener todos los proyectos con colaboradores y recursos
app.get('/proyectos', (req, res) => {
  db.query('SELECT * FROM proyecto', (err, result) => {
    if (err) {
      res.status(500).send({ message: 'Error al obtener proyectos' });
    } else {
      res.send(result);
    }
  });
});

// Crear un nuevo proyecto
app.post('/proyectos', (req, res) => {
  const { nombre, descripcion, fecha_inicio, fecha_fin, estado } = req.body;

  db.query(
    'INSERT INTO proyecto (nombre, descripcion, fecha_inicio, fecha_fin, estado) VALUES (?, ?, ?, ?, ?)',
    [nombre, descripcion, fecha_inicio, fecha_fin, estado],
    (err, result) => {
      if (err) {
        res.status(500).send({ message: 'Error al crear proyecto' });
      } else {
        res.send({ message: 'Proyecto creado con éxito', id_proyecto: result.insertId }); // Envío del ID del nuevo proyecto
      }
    }
  );
});

// Actualizar un proyecto existente
app.put('/proyectos/:id', (req, res) => {
  const { id } = req.params;
  const { nombre, descripcion, fecha_inicio, fecha_fin, estado } = req.body;

  db.query(
    'UPDATE proyecto SET nombre = ?, descripcion = ?, fecha_inicio = ?, fecha_fin = ?, estado = ? WHERE id_proyecto = ?',
    [nombre, descripcion, fecha_inicio, fecha_fin, estado, id],
    (err, result) => {
      if (err) {
        res.status(500).send({ message: 'Error al actualizar proyecto' });
      } else {
        res.send({ message: 'Proyecto actualizado con éxito' });
      }
    }
  );
});


// Eliminar un proyecto
app.delete('/proyectos/:id', (req, res) => {
  const { id } = req.params;

  db.query('DELETE FROM proyecto WHERE id_proyecto = ?', [id], (err, result) => {
    if (err) {
      res.status(500).send({ message: 'Error al eliminar proyecto' });
    } else {
      res.send({ message: 'Proyecto eliminado con éxito' });
    }
  });
});

// Obtener el total de proyectos activos
app.get('/proyectos/count/activos', (req, res) => {
  db.query('SELECT COUNT(*) AS total FROM proyecto WHERE estado = ?', ['Activo'], (err, result) => {
    if (err) {
      res.status(500).send({ message: 'Error al obtener el total de proyectos activos' });
    } else {
      res.send({ total: result[0].total });
    }
  });
});



//************************MODULO DE SEGUIMIENTO DE PROYECTOS***************************/
// Obtener todos los seguimientos de proyectos
// Obtener todas las asignaciones (INNER JOIN de las tablas intermedias)
app.get('/asignaciones', (req, res) => {
  const query = `
    SELECT ap.id_asignacion, p.nombre AS nombre_proyecto, c.nombre AS nombre_colaborador, r.nombre_recurso
    FROM colaborador_proyecto cp
    INNER JOIN colaborador c ON cp.id_colaborador = c.id_colaborador
    INNER JOIN proyecto p ON cp.id_proyecto = p.id_proyecto
    INNER JOIN recurso_proyecto rp ON p.id_proyecto = rp.id_proyecto
    INNER JOIN recurso r ON rp.id_recurso = r.id_recurso;
  `;

  db.query(query, (err, result) => {
    if (err) {
      res.status(500).send({ message: 'Error al obtener las asignaciones' });
    } else {
      res.send(result);
    }
  });
});

// Crear una nueva asignación (relacionar colaborador, proyecto y recurso)
app.post('/asignaciones', (req, res) => {
  const { id_proyecto, id_colaborador, id_recurso } = req.body;

  // Insertar en la tabla colaborador_proyecto
  const queryColaboradorProyecto = 'INSERT INTO colaborador_proyecto (id_colaborador, id_proyecto) VALUES (?, ?)';
  // Insertar en la tabla recurso_proyecto
  const queryRecursoProyecto = 'INSERT INTO recurso_proyecto (id_recurso, id_proyecto) VALUES (?, ?)';

  // Iniciar la transacción
  db.beginTransaction((err) => {
    if (err) {
      return res.status(500).send({ message: 'Error al iniciar la transacción' });
    }

    // Insertar en colaborador_proyecto
    db.query(queryColaboradorProyecto, [id_colaborador, id_proyecto], (err, resultColaboradorProyecto) => {
      if (err) {
        return db.rollback(() => {
          res.status(500).send({ message: 'Error al asignar colaborador al proyecto' });
        });
      }

      // Insertar en recurso_proyecto
      db.query(queryRecursoProyecto, [id_recurso, id_proyecto], (err, resultRecursoProyecto) => {
        if (err) {
          return db.rollback(() => {
            res.status(500).send({ message: 'Error al asignar recurso al proyecto' });
          });
        }

        // Si ambas inserciones fueron exitosas, hacer commit de la transacción
        db.commit((err) => {
          if (err) {
            return db.rollback(() => {
              res.status(500).send({ message: 'Error al finalizar la transacción' });
            });
          }
          res.send({ message: 'Asignación creada con éxito' });
        });
      });
    });
  });
});

// Actualizar una asignación
app.put('/asignaciones/:id', (req, res) => {
  const { id } = req.params; // id de la asignación
  const { id_proyecto, id_colaborador, id_recurso } = req.body;

  // Actualizar en colaborador_proyecto
  const queryColaboradorProyecto = 'UPDATE colaborador_proyecto SET id_colaborador = ?, id_proyecto = ? WHERE id_asignacion = ?';
  // Actualizar en recurso_proyecto
  const queryRecursoProyecto = 'UPDATE recurso_proyecto SET id_recurso = ?, id_proyecto = ? WHERE id_asignacion = ?';

  // Iniciar la transacción
  db.beginTransaction((err) => {
    if (err) {
      return res.status(500).send({ message: 'Error al iniciar la transacción' });
    }

    // Actualizar en colaborador_proyecto
    db.query(queryColaboradorProyecto, [id_colaborador, id_proyecto, id], (err, resultColaboradorProyecto) => {
      if (err) {
        return db.rollback(() => {
          res.status(500).send({ message: 'Error al actualizar la asignación en colaborador_proyecto' });
        });
      }

      // Actualizar en recurso_proyecto
      db.query(queryRecursoProyecto, [id_recurso, id_proyecto, id], (err, resultRecursoProyecto) => {
        if (err) {
          return db.rollback(() => {
            res.status(500).send({ message: 'Error al actualizar la asignación en recurso_proyecto' });
          });
        }

        // Si ambas actualizaciones fueron exitosas, hacer commit de la transacción
        db.commit((err) => {
          if (err) {
            return db.rollback(() => {
              res.status(500).send({ message: 'Error al finalizar la transacción' });
            });
          }
          res.send({ message: 'Asignación actualizada con éxito' });
        });
      });
    });
  });
});

// Eliminar una asignación
app.delete('/asignaciones/:id', (req, res) => {
  const { id } = req.params;

  // Borrar de colaborador_proyecto
  const queryColaboradorProyecto = 'DELETE FROM colaborador_proyecto WHERE id_asignacion = ?';
  // Borrar de recurso_proyecto
  const queryRecursoProyecto = 'DELETE FROM recurso_proyecto WHERE id_asignacion = ?';

  // Iniciar la transacción
  db.beginTransaction((err) => {
    if (err) {
      return res.status(500).send({ message: 'Error al iniciar la transacción' });
    }

    // Eliminar de colaborador_proyecto
    db.query(queryColaboradorProyecto, [id], (err, resultColaboradorProyecto) => {
      if (err) {
        return db.rollback(() => {
          res.status(500).send({ message: 'Error al eliminar la asignación de colaborador_proyecto' });
        });
      }

      // Eliminar de recurso_proyecto
      db.query(queryRecursoProyecto, [id], (err, resultRecursoProyecto) => {
        if (err) {
          return db.rollback(() => {
            res.status(500).send({ message: 'Error al eliminar la asignación de recurso_proyecto' });
          });
        }

        // Si ambas eliminaciones fueron exitosas, hacer commit de la transacción
        db.commit((err) => {
          if (err) {
            return db.rollback(() => {
              res.status(500).send({ message: 'Error al finalizar la transacción' });
            });
          }
          res.send({ message: 'Asignación eliminada con éxito' });
        });
      });
    });
  });
});

/************************MODULO DE PLAN DE PRUEBAS *****************/
// Obtener todos los planes de prueba con información del proyecto
app.get('/planPruebas', (req, res) => {
  const query = `
    SELECT pp.*, p.nombre AS nombre_proyecto
    FROM plan_prueba pp
    INNER JOIN proyecto p ON pp.id_proyecto = p.id_proyecto
    ORDER BY pp.id_plan ASC
  `;

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).send({ message: 'Error al obtener los planes de prueba' });
    }
    res.send(results);
  });
});


// Crear un nuevo plan de pruebas
app.post('/planPruebas', (req, res) => {
  const { nombre_plan, descripcion, fecha_creacion, id_proyecto } = req.body;

  db.query(
    'INSERT INTO plan_prueba (nombre_plan, descripcion, fecha_creacion, id_proyecto) VALUES (?, ?, ?, ?)',
    [nombre_plan, descripcion, fecha_creacion, id_proyecto],
    (err, result) => {
      if (err) {
        res.status(500).send({ message: 'Error al crear plan de pruebas' });
      } else {
        res.send({ message: 'Plan de pruebas creado con éxito', id_plan: result.insertId }); // Agregamos el ID en la respuesta
      }
    }
  );
});

// Actualizar un plan de pruebas existente
app.put('/planPruebas/:id', (req, res) => {
  const { id } = req.params;
  const { nombre_plan, descripcion, fecha_creacion, id_proyecto } = req.body;

  db.query(
    'UPDATE plan_prueba SET nombre_plan = ?, descripcion = ?, fecha_creacion = ?, id_proyecto = ? WHERE id_plan = ?',
    [nombre_plan, descripcion, fecha_creacion, id_proyecto, id],
    (err, result) => {
      if (err) {
        res.status(500).send({ message: 'Error al actualizar plan de pruebas' });
      } else {
        res.send({ message: 'Plan de pruebas actualizado con éxito' });
      }
    }
  );
});

// Eliminar un plan de pruebas
app.delete('/planPruebas/:id', (req, res) => {
  const { id } = req.params;

  db.query('DELETE FROM plan_prueba WHERE id_plan = ?', [id], (err, result) => {
    if (err) {
      res.status(500).send({ message: 'Error al eliminar plan de pruebas' });
    } else {
      res.send({ message: 'Plan de pruebas eliminado con éxito' });
    }
  });
});

// Obtener el total de planes de pruebas
app.get('/planPruebas/count', (req, res) => {
  db.query('SELECT COUNT(*) AS total FROM plan_prueba', (err, result) => {
    if (err) {
      res.status(500).send({ message: 'Error al obtener el total de planes de pruebas' });
    } else {
      res.send({ total: result[0].total });
    }
  });
});


/*************************MODULO DE CASOS DE PRUEBA *********************/
// Obtener todos los casos de prueba
app.get('/casoPruebas', (req, res) => {
  const query = `
    SELECT cp.*, p.nombre_plan AS nombre_plan
    FROM caso_prueba cp
    INNER JOIN plan_prueba p ON cp.id_plan = p.id_plan
    ORDER BY cp.id_caso_prueba ASC
  `;

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).send({ message: 'Error al obtener los casos de prueba' });
    }
    res.send(results);
  });
});

// Crear un nuevo caso de prueba
app.post('/casoPruebas', (req, res) => {
  const { nombre_caso, descripcion, resultado_esperado, id_plan } = req.body;

  db.query(
    'INSERT INTO caso_prueba (nombre_caso, descripcion, resultado_esperado, id_plan) VALUES (?, ?, ?, ?)',
    [nombre_caso, descripcion, resultado_esperado, id_plan],
    (err, result) => {
      if (err) {
        res.status(500).send({ message: 'Error al crear el caso de prueba' });
      } else {
        res.send({ message: 'Caso de prueba creado con éxito', id_caso: result.insertId }); // Agregamos el ID en la respuesta
      }
    }
  );
});

// Actualizar un caso de prueba existente
app.put('/casoPruebas/:id', (req, res) => {
  const { id } = req.params;
  const { nombre_caso, descripcion, resultado_esperado, id_plan } = req.body;

  db.query(
    'UPDATE caso_prueba SET nombre_caso = ?, descripcion = ?, resultado_esperado = ?, id_plan = ? WHERE id_caso_prueba = ?',
    [nombre_caso, descripcion, resultado_esperado, id_plan, id],
    (err, result) => {
      if (err) {
        res.status(500).send({ message: 'Error al actualizar el caso de prueba' });
      } else {
        res.send({ message: 'Caso de prueba actualizado con éxito' });
      }
    }
  );
});

// Eliminar un caso de prueba
app.delete('/casoPruebas/:id', (req, res) => {
  const { id } = req.params;

  db.query('DELETE FROM caso_prueba WHERE id_caso_prueba = ?', [id], (err, result) => {
    if (err) {
      res.status(500).send({ message: 'Error al eliminar el caso de prueba' });
    } else {
      res.send({ message: 'Caso de prueba eliminado con éxito' });
    }
  });
});

// Obtener el total de casos de prueba
app.get('/casoPruebas/count', (req, res) => {
  db.query('SELECT COUNT(*) AS total FROM caso_prueba', (err, result) => {
    if (err) {
      res.status(500).send({ message: 'Error al obtener el total de casos de prueba' });
    } else {
      res.send({ total: result[0].total });
    }
  });
});

/******************MODULO DE EJECUCION DE PRUEBAS *****************/
// Obtener todas las ejecuciones de prueba
app.get('/ejecucionPruebas', (req, res) => {
  const query = `
    SELECT ep.*, cp.nombre_caso AS nombre_caso
    FROM ejecucion_prueba ep
    INNER JOIN caso_prueba cp ON ep.id_caso_prueba = cp.id_caso_prueba
    ORDER BY ep.id_ejecucion ASC
  `;

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).send({ message: 'Error al obtener las ejecuciones de prueba' });
    }
    res.send(results);
  });
});

// Crear una nueva ejecución de prueba
app.post('/ejecucionPruebas', (req, res) => {
  const { id_caso_prueba, fecha_ejecucion, resultado, evidencia } = req.body;

  db.query(
    'INSERT INTO ejecucion_prueba (id_caso_prueba, fecha_ejecucion, resultado, evidencia) VALUES (?, ?, ?, ?)',
    [id_caso_prueba, fecha_ejecucion, resultado, evidencia],
    (err, result) => {
      if (err) {
        res.status(500).send({ message: 'Error al crear la ejecución de prueba' });
      } else {
        res.send({ message: 'Ejecución de prueba creada con éxito', id_ejecucion: result.insertId }); // Agregamos el ID en la respuesta
      }
    }
  );
});

// Actualizar una ejecución de prueba existente
app.put('/ejecucionPruebas/:id', (req, res) => {
  const { id } = req.params;
  const { id_caso_prueba, fecha_ejecucion, resultado, evidencia } = req.body;

  db.query(
    'UPDATE ejecucion_prueba SET id_caso_prueba = ?, fecha_ejecucion = ?, resultado = ?, evidencia = ? WHERE id_ejecucion = ?',
    [id_caso_prueba, fecha_ejecucion, resultado, evidencia, id],
    (err, result) => {
      if (err) {
        res.status(500).send({ message: 'Error al actualizar la ejecución de prueba' });
      } else {
        res.send({ message: 'Ejecución de prueba actualizada con éxito' });
      }
    }
  );
});

// Eliminar una ejecución de prueba
app.delete('/ejecucionPruebas/:id', (req, res) => {
  const { id } = req.params;

  db.query('DELETE FROM ejecucion_prueba WHERE id_ejecucion = ?', [id], (err, result) => {
    if (err) {
      res.status(500).send({ message: 'Error al eliminar la ejecución de prueba' });
    } else {
      res.send({ message: 'Ejecución de prueba eliminada con éxito' });
    }
  });
});

// Obtener el total de ejecuciones de prueba
app.get('/ejecucionPruebas/count', (req, res) => {
  db.query('SELECT COUNT(*) AS total FROM ejecucion_prueba', (err, result) => {
    if (err) {
      res.status(500).send({ message: 'Error al obtener el total de ejecuciones de prueba' });
    } else {
      res.send({ total: result[0].total });
    }
  });
});

/***************************** MODULO DE GESTION DE DEFECTOS *************-******* */
////***************MODULO DE DEFECTOS *************/////////////
// Obtener todos los defectos
app.get('/defectos', (req, res) => {
  db.query('SELECT * FROM defecto', (err, result) => {
    if (err) {
      res.status(500).send({ message: 'Error al obtener defectos' });
    } else {
      res.send(result);
    }
  });
});

// Crear un nuevo defecto
app.post('/defectos', (req, res) => {
  const { nombre_defecto, descripcion, severidad, fecha_creacion, fecha_resolucion, estado } = req.body;

  // Validar datos
  if (!nombre_defecto || !descripcion || !severidad || !fecha_creacion || !estado) {
    return res.status(400).send({ message: 'Nombre del defecto, descripción, severidad, fecha de creación y estado son requeridos' });
  }

  db.query(
    'INSERT INTO defecto (nombre_defecto, descripcion, severidad, fecha_creacion, fecha_resolucion, estado) VALUES (?, ?, ?, ?, ?, ?)',
    [nombre_defecto, descripcion, severidad, fecha_creacion, fecha_resolucion, estado],
    (err, result) => {
      if (err) {
        res.status(500).send({ message: 'Error al crear defecto', error: err.message });
      } else {
        res.send({ message: 'Defecto creado con éxito', id_defecto: result.insertId });
      }
    }
  );
});

// Actualizar un defecto existente
app.put('/defectos/:id', (req, res) => {
  const { id } = req.params;
  const { nombre_defecto, descripcion, severidad, fecha_creacion, fecha_resolucion, estado } = req.body;

  // Validar datos
  if (!nombre_defecto || !descripcion || !severidad || !fecha_creacion || !estado) {
    return res.status(400).send({ message: 'Nombre del defecto, descripción, severidad, fecha de creación y estado son requeridos' });
  }

  db.query(
    'UPDATE defecto SET nombre_defecto = ?, descripcion = ?, severidad = ?, fecha_creacion = ?, fecha_resolucion = ?, estado = ? WHERE id_defecto = ?',
    [nombre_defecto, descripcion, severidad, fecha_creacion, fecha_resolucion, estado, id],
    (err, result) => {
      if (err) {
        res.status(500).send({ message: 'Error al actualizar defecto', error: err.message });
      } else {
        res.send({ message: 'Defecto actualizado con éxito' });
      }
    }
  );
});

// Eliminar un defecto
app.delete('/defectos/:id', (req, res) => {
  const { id } = req.params;

  db.query('DELETE FROM defecto WHERE id_defecto = ?', [id], (err, result) => {
    if (err) {
      res.status(500).send({ message: 'Error al eliminar defecto', error: err.message });
    } else {
      res.send({ message: 'Defecto eliminado con éxito' });
    }
  });
});

// Obtener el total de defectos
app.get('/defectos/count', (req, res) => {
  db.query('SELECT COUNT(*) AS total FROM defecto', (err, result) => {
    if (err) {
      res.status(500).send({ message: 'Error al obtener el total de defectos', error: err.message });
    } else {
      res.send({ total: result[0].total });
    }
  });
});

/////////////******************MODULO SEGUIMIENTO DE DETALLE_DEFECTOS*************
// Obtener todos los seguimientos de defectos
app.get('/seguimientodefectos', (req, res) => {
  db.query(`
      SELECT 
          d.id_ejecucion,
          df.nombre_defecto,
          d.id_defecto
      FROM 
          detalle_defecto d
      JOIN 
          defecto df ON d.id_defecto = df.id_defecto
      JOIN 
          ejecucion_prueba ep ON d.id_ejecucion = ep.id_caso_prueba;
  `, (err, result) => {
      if (err) {
          res.status(500).send({ message: 'Error al obtener los detalles de defectos', error: err.message });
      } else {
          res.send(result);
      }
  });
});


// Crear un nuevo seguimiento de defecto
app.post('/seguimientodefectos', (req, res) => {
  const { id_ejecucion, id_defecto } = req.body;

  // Validar datos
  if (!id_ejecucion || !id_defecto) {
    return res.status(400).send({ message: 'ID de ejecución y ID de defecto son requeridos' });
  }

  db.query(
    'INSERT INTO detalle_defecto (id_ejecucion, id_defecto) VALUES (?, ?)',
    [id_ejecucion, id_defecto],
    (err, result) => {
      if (err) {
        res.status(500).send({ message: 'Error al crear seguimiento de defecto', error: err.message });
      } else {
        res.send({ message: 'Seguimiento de defecto creado con éxito', id: result.insertId });
      }
    }
  );
});

// Actualizar un seguimiento de defecto existente
app.put('/seguimientodefectos/:id', (req, res) => {
  const { id } = req.params;
  const { id_ejecucion, id_defecto } = req.body;

  // Validar datos
  if (!id_ejecucion || !id_defecto) {
    return res.status(400).send({ message: 'ID de ejecución y ID de defecto son requeridos' });
  }

  db.query(
    'UPDATE detalle_defecto SET id_ejecucion = ?, id_defecto = ? WHERE id_ejecucion = ?',
    [id_ejecucion, id_defecto, id], // Cambia 'id' si es necesario
    (err, result) => {
      if (err) {
        res.status(500).send({ message: 'Error al actualizar seguimiento de defecto', error: err.message });
      } else {
        res.send({ message: 'Seguimiento de defecto actualizado con éxito' });
      }
    }
  );
});

// Eliminar un seguimiento de defecto
app.delete('/seguimientodefectos/:id', (req, res) => {
  const { id } = req.params;

  db.query('DELETE FROM detalle_defecto WHERE id_ejecucion = ?', [id], (err, result) => { // Cambia 'id' si es necesario
    if (err) {
      res.status(500).send({ message: 'Error al eliminar seguimiento de defecto', error: err.message });
    } else {
      res.send({ message: 'Seguimiento de defecto eliminado con éxito' });
    }
  });
});

// Obtener el total de seguimientos de defectos
app.get('/seguimientodefectos/count', (req, res) => {
  db.query('SELECT COUNT(*) AS total FROM detalle_defecto', (err, result) => {
    if (err) {
      res.status(500).send({ message: 'Error al obtener el total de seguimientos de defectos', error: err.message });
    } else {
      res.send({ total: result[0].total });
    }
  });
});

//**********************MODULO DE INFORMES *******************/
// Obtener todos los informes
app.get('/informes', (req, res) => {
  const query = `
    SELECT i.*, p.nombre AS nombre_proyecto
    FROM informe i
    INNER JOIN proyecto p ON i.id_proyecto = p.id_proyecto
    ORDER BY i.id_informe ASC
  `;

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).send({ message: 'Error al obtener los informes' });
    }
    res.send(results);
  });
});


// Crear un nuevo informe
app.post('/informes', (req, res) => {
  const { id_proyecto, nombre_informe, descripcion, fecha_creacion } = req.body;

  db.query(
    'INSERT INTO informe (id_proyecto, nombre_informe, descripcion, fecha_creacion) VALUES (?, ?, ?, ?)',
    [id_proyecto, nombre_informe, descripcion, fecha_creacion],
    (err, result) => {
      if (err) {
        res.status(500).send({ message: 'Error al crear el informe' });
      } else {
        res.send({ message: 'Informe creado con éxito', id_informe: result.insertId }); // Agregamos el ID en la respuesta
      }
    }
  );
});

// Actualizar un informe existente
app.put('/informes/:id', (req, res) => {
  const { id } = req.params;
  const { id_proyecto, nombre_informe, descripcion, fecha_creacion } = req.body;

  db.query(
    'UPDATE informe SET id_proyecto = ?, nombre_informe = ?, descripcion = ?, fecha_creacion = ? WHERE id_informe = ?',
    [id_proyecto, nombre_informe, descripcion, fecha_creacion, id],
    (err, result) => {
      if (err) {
        res.status(500).send({ message: 'Error al actualizar el informe' });
      } else {
        res.send({ message: 'Informe actualizado con éxito' });
      }
    }
  );
});

// Eliminar un informe
app.delete('/informes/:id', (req, res) => {
  const { id } = req.params;

  db.query('DELETE FROM informe WHERE id_informe = ?', [id], (err, result) => {
    if (err) {
      res.status(500).send({ message: 'Error al eliminar el informe' });
    } else {
      res.send({ message: 'Informe eliminado con éxito' });
    }
  });
});

// Obtener el total de informes
app.get('/informes/count', (req, res) => {
  db.query('SELECT COUNT(*) AS total FROM informe', (err, result) => {
    if (err) {
      res.status(500).send({ message: 'Error al obtener el total de informes' });
    } else {
      res.send({ total: result[0].total });
    }
  });
});

/************************MODULO DE METRICAS ************ */
// Obtener todas las métricas con el nombre del proyecto
app.get('/metricas', (req, res) => {
  db.query(`
    SELECT metrica_prueba.*, proyecto.nombre AS nombre_proyecto 
    FROM metrica_prueba
    INNER JOIN proyecto ON metrica_prueba.id_proyecto = proyecto.id_proyecto;
  `, (err, result) => {
    if (err) {
      res.status(500).send({ message: 'Error al obtener las métricas', error: err.message });
    } else {
      res.send(result);
    }
  });
});


// Crear una nueva métrica
app.post('/metricas', (req, res) => {
  const { id_proyecto, total_pruebas, pruebas_exitosas, pruebas_fallidas, defectos_encontrados, defectos_resueltos, fecha_generacion } = req.body;

  // Validar datos
  if (!id_proyecto || !total_pruebas || !pruebas_exitosas || !pruebas_fallidas || !defectos_encontrados || !defectos_resueltos || !fecha_generacion) {
    return res.status(400).send({ message: 'Todos los campos son requeridos' });
  }

  db.query(
    'INSERT INTO metrica_prueba (id_proyecto, total_pruebas, pruebas_exitosas, pruebas_fallidas, defectos_encontrados, defectos_resueltos, fecha_generacion) VALUES (?, ?, ?, ?, ?, ?, ?)',
    [id_proyecto, total_pruebas, pruebas_exitosas, pruebas_fallidas, defectos_encontrados, defectos_resueltos, fecha_generacion],
    (err, result) => {
      if (err) {
        res.status(500).send({ message: 'Error al crear la métrica', error: err.message });
      } else {
        res.send({ message: 'Métrica creada con éxito', id: result.insertId });
      }
    }
  );
});

// Actualizar una métrica existente
app.put('/metricas/:id_metrica', (req, res) => {
  const { id_metrica } = req.params;
  const { id_proyecto, total_pruebas, pruebas_exitosas, pruebas_fallidas, defectos_encontrados, defectos_resueltos, fecha_generacion } = req.body;

  // Validar datos
  if (!id_proyecto || !total_pruebas || !pruebas_exitosas || !pruebas_fallidas || !defectos_encontrados || !defectos_resueltos || !fecha_generacion) {
    return res.status(400).send({ message: 'Todos los campos son requeridos' });
  }

  db.query(
    'UPDATE metrica_prueba SET id_proyecto = ?, total_pruebas = ?, pruebas_exitosas = ?, pruebas_fallidas = ?, defectos_encontrados = ?, defectos_resueltos = ?, fecha_generacion = ? WHERE id_metrica = ?',
    [id_proyecto, total_pruebas, pruebas_exitosas, pruebas_fallidas, defectos_encontrados, defectos_resueltos, fecha_generacion, id_metrica],
    (err, result) => {
      if (err) {
        res.status(500).send({ message: 'Error al actualizar la métrica', error: err.message });
      } else {
        res.send({ message: 'Métrica actualizada con éxito' });
      }
    }
  );
});

// Eliminar una métrica
app.delete('/metricas/:id_metrica', (req, res) => {
  const { id_metrica } = req.params;

  db.query('DELETE FROM metrica_prueba WHERE id_metrica = ?', [id_metrica], (err, result) => {
    if (err) {
      res.status(500).send({ message: 'Error al eliminar la métrica', error: err.message });
    } else {
      res.send({ message: 'Métrica eliminada con éxito' });
    }
  });
});


// Obtener el total de métricas
app.get('/metricas/count', (req, res) => {
  db.query('SELECT COUNT(*) AS total FROM metrica_prueba', (err, result) => {
    if (err) {
      res.status(500).send({ message: 'Error al obtener el total de métricas', error: err.message });
    } else {
      res.send({ total: result[0].total });
    }
  });
});


/***************MODULO DE USUARIOS ****************/
// Obtener todos los usuarios
app.get('/users', (req, res) => {
  db.query('SELECT * FROM users', (err, result) => {
    if (err) {
      res.status(500).send({ message: 'Error al obtener usuarios' });
    } else {
      res.send(result);
    }
  });
});

// Actualizar un usuario existente
app.put('/users/:id', (req, res) => {
  const { id } = req.params;
  const { username, email, password, created_at } = req.body;

  // Validar datos
  if (!username || !email || !password || !created_at) {
    return res.status(400).send({ message: 'Username, email, password y fecha de creación son requeridos' });
  }

  db.query(
    'UPDATE users SET username = ?, email = ?, password = ?, created_at = ? WHERE id = ?',
    [username, email, password, created_at, id],
    (err, result) => {
      if (err) {
        res.status(500).send({ message: 'Error al actualizar usuario', error: err.message });
      } else {
        res.send({ message: 'Usuario actualizado con éxito' });
      }
    }
  );
});

// Eliminar un usuario
app.delete('/users/:id', (req, res) => {
  const { id } = req.params;

  db.query('DELETE FROM users WHERE id = ?', [id], (err, result) => {
    if (err) {
      res.status(500).send({ message: 'Error al eliminar usuario', error: err.message });
    } else {
      res.send({ message: 'Usuario eliminado con éxito' });
    }
  });
});

/***************************MODULO DE ASIGNACIONES  **************/
// Obtener todas las asignaciones
app.get('/asignacion_proyecto', (req, res) => {
  const query = `
    SELECT ap.*, p.nombre AS nombre_proyecto, c.nombre AS nombre_colaborador, r.nombre_recurso AS nombre_recurso
    FROM asignacion_proyecto ap
    INNER JOIN proyecto p ON ap.id_proyecto = p.id_proyecto
    INNER JOIN colaborador c ON ap.id_colaborador = c.id_colaborador
    INNER JOIN recurso r ON ap.id_recurso = r.id_recurso
    ORDER BY ap.id_asignacion ASC
  `;

  db.query(query, (err, results) => {
    if (err) {
      return res.status(500).send({ message: 'Error al obtener las asignaciones' });
    }
    res.send(results);
  });
});

// Crear una nueva asignación
app.post('/asignacion_proyecto', (req, res) => {
  const { id_proyecto, id_colaborador, id_recurso, estado } = req.body;

  db.query(
    'INSERT INTO asignacion_proyecto (id_proyecto, id_colaborador, id_recurso, estado) VALUES (?, ?, ?, ?)',
    [id_proyecto, id_colaborador, id_recurso, estado],
    (err, result) => {
      if (err) {
        return res.status(500).send({ message: 'Error al crear la asignación' });
      } else {
        res.send({ message: 'Asignación creada con éxito', id_asignacion: result.insertId }); // Agregamos el ID en la respuesta
      }
    }
  );
});

// Actualizar una asignación existente
app.put('/asignacion_proyecto/:id', (req, res) => {
  const { id } = req.params;
  const { id_proyecto, id_colaborador, id_recurso, estado } = req.body;

  db.query(
    'UPDATE asignacion_proyecto SET id_proyecto = ?, id_colaborador = ?, id_recurso = ?, estado = ? WHERE id_asignacion = ?',
    [id_proyecto, id_colaborador, id_recurso, estado, id],
    (err, result) => {
      if (err) {
        return res.status(500).send({ message: 'Error al actualizar la asignación' });
      } else {
        res.send({ message: 'Asignación actualizada con éxito' });
      }
    }
  );
});

// Eliminar una asignación
app.delete('/asignacion_proyecto/:id', (req, res) => {
  const { id } = req.params;

  db.query('DELETE FROM asignacion_proyecto WHERE id_asignacion = ?', [id], (err, result) => {
    if (err) {
      return res.status(500).send({ message: 'Error al eliminar la asignación' });
    } else {
      res.send({ message: 'Asignación eliminada con éxito' });
    }
  });
});

