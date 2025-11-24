const express = require('express');
const cors = require('cors');
const path = require('path');
const bienesRoutes = require('./routes/bienes.routes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Ruta (Fotos subidas)
app.use('/imagenes', express.static(path.join(__dirname, '../uploads')));

// Rutas API (Prefijo /api)
app.use('/api', bienesRoutes);

app.listen(3000, () => console.log('Microservicio MVC corriendo en puerto 3000'));