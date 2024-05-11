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
app.get('/api/registro', (req, res) => {
  
  pool.query('SELECT * FROM registro', (error, results) => {
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
  const { empleado_id_emp, espacio_id_esp, fecha_salida, fecha_entrada } = req.body; // Datos del cuerpo de la solicitud
  const query = 'INSERT INTO REGISTRO (id_registro, empleado_id_emp, espacio_id_esp, fecha_salida, fecha_entrada) VALUES (default, $1, $2, $3, $4)';
  pool.query(query, [empleado_id_emp, espacio_id_esp, fecha_salida, fecha_entrada], (error, results) => {
    if (error) {
      console.error('Error al insertar datos: ', error);
      res.status(500).json({ error: 'Error al insertar datos' });
      return;
    }
    res.json({ message: 'Datos insertados correctamente' });
    console.log('grabar registro aseo');
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
