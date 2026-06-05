const { logger } = require('../utils/logger');

function registrarSolicitud(req, res, next) {
  const inicio = Date.now();

  res.on('finish', () => {
    logger.info('Solicitud HTTP atendida', {
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: Date.now() - inicio,
    });
  });

  next();
}

module.exports = {
  registrarSolicitud,
};