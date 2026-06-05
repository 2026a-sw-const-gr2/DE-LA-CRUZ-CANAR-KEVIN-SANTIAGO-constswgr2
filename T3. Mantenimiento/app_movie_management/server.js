const express = require('express');
const path = require('path');

const { port } = require('./src/config/env');
const peliculasRoutes = require('./src/routes/peliculas.routes');
const { registrarSolicitud } = require('./src/middlewares/requestLogger');
const { logger } = require('./src/utils/logger');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/peliculas', registrarSolicitud);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

app.use('/peliculas', peliculasRoutes);

app.use((req, res) => {
  logger.warn('Ruta no encontrada', {
    method: req.method,
    path: req.originalUrl,
  });
  res.status(404).json({ message: 'Ruta no encontrada' });
});

app.use((err, req, res, next) => {
  logger.error('Error interno del servidor', {
    message: err.message,
    stack: err.stack,
    method: req.method,
    path: req.originalUrl,
  });
  res.status(500).json({ message: 'Error interno del servidor' });
});

app.listen(port, () => {
  logger.info('Servidor iniciado', {
    url: `http://localhost:${port}`,
  });
});