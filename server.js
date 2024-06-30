const express = require('express');
const { Pool } = require('pg');

const app = express();
const port = 3000;

const cors = require('cors');

// Middleware para analizar el cuerpo de la solicitud como JSON
app.use(express.json());

// Configuración de CORS
app.use(cors());

// Configuración de la conexión a la base de datos PostgreSQL
const pool = new Pool({
  host: 'dpg-coi2rrdjm4es739hoqh0-a.oregon-postgres.render.com',
  user: 'admin',
  password: '27mkJDxEeTgFA9oWunHDm889rp5vHEyu',
  database: 'bd_portafolio_filr',
  ssl: {
    rejectUnauthorized: false, 
  },
});

// Conexión a la base de datos PostgreSQL
pool.connect((err, client, release) => {
  if (err) {
    console.error('Error al conectar a la base de datos: ', err);
    return;
  }
  console.log('Conexión a la base de datos PostgreSQL establecida');
});

app.get('/login', (req, res) => {
  const rut = req.query.rut; // Extraer rut de la solicitud
  const contra_emp = req.query.contra_emp // Extraer contraseña de la solicitud
  const query = 'SELECT * FROM empleado WHERE rut = $1 and contra_emp = $2';
  
  pool.query(query, [rut,contra_emp], (error, results) => {
    if (error) {
      console.error('Error al realizar la consulta: ', error);
      res.status(500).json({ error: 'Error al obtener datos' });
      return;
    }
    res.json(results.rows);
    console.log('login');
  });
});



app.get('/empleado', (req, res) => {
  
  pool.query('SELECT * FROM empleado', (error, results) => {
    if (error) {
      console.error('Error al realizar la consulta: ', error);
      res.status(500).json({ error: 'Error al obtener datos' });
      return;
    }
    res.json(results.rows);
    console.log('select');
  });
});


app.post('/api/insertRegistro', (req, res) => {
  const { empleado_id_emp, espacio_id_esp, fecha_entrada, fecha_salida } = req.body; // Datos del cuerpo de la solicitud
  const query = 'INSERT INTO REGISTRO (id_registro, empleado_id_emp, espacio_id_esp, fecha_entrada, fecha_salida) VALUES (default, $1, $2, $3, $4)';
  pool.query(query, [empleado_id_emp, espacio_id_esp, fecha_entrada, fecha_salida, ], (error, results) => {
    if (error) {
      console.error('Error al insertar datos: ', error);
      res.status(500).json({ error: 'Error al insertar datos' });
      return;
    }
    res.json({ message: 'Datos insertados correctamente' });
    console.log('grabar registro aseo');
  });
});

//nuevos endpoints para registros
app.post('/api/inicioAseo', (req, res) => {
  const { empleado_id_emp, espacio_id_esp, fecha_entrada } = req.body; // Datos del cuerpo de la solicitud
  const query = 'INSERT INTO REGISTRO (id_registro,empleado_id_emp, espacio_id_esp, fecha_entrada, fecha_salida) VALUES (default,$1, $2, $3, null) RETURNING id_registro';
  
  pool.query(query, [empleado_id_emp, espacio_id_esp, fecha_entrada], (error, results) => {
    if (error) {
      console.error('Error al insertar datos: ', error);
      res.status(500).json({ error: 'Error al insertar datos' });
      return;
    }

    const id_registro = results.rows[0].id_registro;
    res.status(201).json({ id_registro });
    console.log('Registro de aseo grabado con ID:', id_registro);
  });
});

//insertar observacion
app.post('/api/insertObservacion', (req, res) => {
  const { descripcion, enlace, id_registro, tipo_observacion } = req.body; // Datos del cuerpo de la solicitud
  const query = 'INSERT INTO OBSERVACION (obv_id, descripcion, enlace, id_registro, tipo_observacion) VALUES (default, $1, $2, $3, $4)';
  pool.query(query, [descripcion, enlace, id_registro, tipo_observacion ], (error, results) => {
    if (error) {
      console.error('Error al insertar datos: ', error);
      res.status(500).json({ error: 'Error al insertar datos' });
      return;
    }
    res.json({ message: 'Datos insertados correctamente' });
    console.log('grabar registro aseo');
  });
});

//modificar 
app.put('/api/finalizarAseo', (req, res) => {
  const { fecha_salida,id_registro,espacio_id_esp } = req.body; // Datos del cuerpo de la solicitud
  const query = 'UPDATE REGISTRO SET fecha_salida = $1 WHERE id_registro = $2 and espacio_id_esp = $3';

  pool.query(query, [fecha_salida,id_registro,espacio_id_esp], (error, results) => {
    if (error) {
      console.error('Error al actualizar datos: ', error);
      res.status(500).json({ error: 'Error al actualizar datos' });
      return;
    }

    res.status(200).json({ message: 'Datos actualizados correctamente' });
    console.log('Registro de aseo finalizado con ID:', id_registro);
  });
});

//solicitar registros por usuario
app.get('/registros', (req, res) => {
  const id = req.query.id; // Extraer rut de la solicitud// Extraer contraseña de la solicitud
  const query = 'select id_registro,espacio_id_esp, fecha_entrada,fecha_salida from registro where empleado_id_emp = $1';
  
  pool.query(query, [id], (error, results) => {
    if (error) {
      console.error('Error al realizar la consulta: ', error);
      res.status(500).json({ error: 'Error al obtener datos' });
      return;
    }
    res.json(results.rows);
    console.log('select registros usuario' + id);
  });
});

app.get('/registrosCard', (req, res) => {
  const id = req.query.id; // Extraer rut de la solicitud// Extraer contraseña de la solicitud
  const query = `select id_registro, empleado.nombre, empleado.apellido_p, espacio_id_esp, fecha_entrada, fecha_salida from registro
left join empleado on registro.empleado_id_emp = empleado.id_emp
where registro.empleado_id_emp = $1 order by id_registro desc`;
  
  pool.query(query, [id], (error, results) => {
    if (error) {
      console.error('Error al realizar la consulta: ', error);
      res.status(500).json({ error: 'Error al obtener datos' });
      return;
    }
    res.json(results.rows);
    console.log('select registros usuario' + id);
  });
});

app.get('/horario', (req, res) => {
  const dia = req.query.dia; // Extraer rut de la solicitud// Extraer contraseña de la solicitud
  const query = 'select * from horario where dia = $1 order by hora_entrada asc';
  
  pool.query(query, [dia], (error, results) => {
    if (error) {
      console.error('Error al realizar la consulta: ', error);
      res.status(500).json({ error: 'Error al obtener datos' });
      return;
    }
    res.json(results.rows);
    console.log('select registros usuario');
  });
});









//registro con procedimiento almacenado
app.post('/api/insertRegObs', (req, res) => {
  const { empleado_id_emp, espacio_id_esp, fecha_entrada, fecha_salida, tipo, descripcion, enlace } = req.body;

  const query = `CALL p_reg_obs($1, $2, $3, $4, $5, $6, $7)`;

  pool.query(query, [ empleado_id_emp, espacio_id_esp, fecha_entrada, fecha_salida, tipo, descripcion, enlace], (error, results) => {
    if (error) {
      console.error('Error al llamar al procedimiento almacenado: ', error);
      res.status(500).json({ error: 'Error al ejecutar el procedimiento almacenado' });
      return;
    }
    res.json({ message: 'Procedimiento almacenado ejecutado correctamente' });
    console.log('Procedimiento almacenado ejecutado');
  });
});

app.post('/api/observacion', (req, res) => {
  const { rut, entrada, salida, tipo, nDocumento} = req.body; // Datos del cuerpo de la solicitud
  const query = 'INSERT INTO observacion (descripcion, registro_id_registro, tipo_observacion_id_categoria) VALUES ($1, $2, $3)';
  pool.query(query, [rut, entrada, salida, tipo, nDocumento], (error, results) => {
    if (error) {
      console.error('Error al insertar datos: ', error);
      res.status(500).json({ error: 'Error al insertar datos' });
      return;
    }
    res.json({ message: 'Datos insertados correctamente' });
    console.log('insert');
  });
});


// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en el puerto ${port}`);
});
