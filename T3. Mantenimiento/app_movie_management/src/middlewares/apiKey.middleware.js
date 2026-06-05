const { apiKey: apiKeyPorDefecto } = require('../config/env');
const { logger } = require('../utils/logger');

function crearApiKeyMiddleware(apiKeyValida = apiKeyPorDefecto) {
  return function validarApiKey(req, res, next) {
    const apiKeyRecibida = String(req.header('X-FIS-EPN-KEY') || '').trim();

    if (!apiKeyRecibida) {
      logger.warn('Solicitud rechazada por ausencia de API key', {
        method: req.method,
        path: req.originalUrl,
        ip: req.ip,
      });

      return res.status(401).json({
        message: 'Falta la cabecera X-FIS-EPN-KEY',
      });
    }

    if (apiKeyRecibida !== apiKeyValida) {
      logger.warn('Solicitud rechazada por API key invalida', {
        method: req.method,
        path: req.originalUrl,
        ip: req.ip,
      });

      return res.status(403).json({
        message: 'API key invalida',
      });
    }

    return next();
  };
}

module.exports = {
  crearApiKeyMiddleware,
  validarApiKey: crearApiKeyMiddleware(),
};