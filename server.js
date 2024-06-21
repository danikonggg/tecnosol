const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const myconn = require('express-myconnection');
const routes = require('./routes');

const app = express();
app.set('port', process.env.PORT || 9000);

const dbOptions = {
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'tecnosol'
};

// Middleware para habilitar CORS
app.use(cors());

// Middleware para la conexión a la base de datos
app.use(myconn(mysql, dbOptions, 'single'));

// Middleware para parsear JSON
app.use(express.json());

// Ruta principal
app.get('/', (req, res) => {
    res.send('Welcome to my API');
});

// Rutas de la API
app.use('/api', routes);

// Iniciar el servidor
app.listen(app.get('port'), () => {
    console.log(`Server running on port ${app.get('port')}`);
});
