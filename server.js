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
  host: 'dpg-cnu6m2uct0pc73e49m9g-a.oregon-postgres.render.com',
  user: 'admin',
  password: 'Zk4eFxNCiRqpHWAosvCX2XgTqbh3fxRR',
  database: 'registros_haoe',
  ssl: {
    rejectUnauthorized: false, // Para evitar errores de certificado no autorizado, úsalo con precaución
    // Puedes proporcionar la ruta a los archivos de certificado y clave privada si los estás utilizando
    // cert: fs.readFileSync('/ruta/al/archivo/certificado.pem'),
    // key: fs.readFileSync('/ruta/al/archivo/clave_privada.key'),
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

app.get('/api/datos', (req, res) => {
  // consulta bd
  pool.query('SELECT * FROM registros ORDER BY id DESC', (error, results) => {
    if (error) {
      console.error('Error al realizar la consulta: ', error);
      res.status(500).json({ error: 'Error al obtener datos' });
      return;
    }
    res.json(results.rows);
    console.log('select');
  });
});

app.get('/api/datosfechaactual', (req, res) => {
  // consulta bd
  pool.query('SELECT * FROM registros WHERE fecha = CURRENT_DATE ORDER BY id DESC', (error, results) => {
    if (error) {
      console.error('Error al realizar la consulta: ', error);
      res.status(500).json({ error: 'Error al obtener datos' });
      return;
    }
    res.json(results.rows);
    console.log('select');
  });
});

app.get('/api/datos/filtro', (req, res) => {
  const fecha = req.query.fecha; // Extraer la fecha de la solicitud
  const query = 'SELECT * FROM registros WHERE fecha = $1 ORDER BY id DESC';
  
  pool.query(query, [fecha], (error, results) => {
    if (error) {
      console.error('Error al realizar la consulta: ', error);
      res.status(500).json({ error: 'Error al obtener datos' });
      return;
    }
    res.json(results.rows);
    console.log('select');
  });
});

app.post('/api/datos', (req, res) => {
  const { rut, entrada, salida, tipo, nDocumento} = req.body; // Datos del cuerpo de la solicitud
  const query = 'INSERT INTO registros (rut, entrada, salida, tipo, nDocumento, fecha) VALUES ($1, $2, $3, $4, $5, current_date)';
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
