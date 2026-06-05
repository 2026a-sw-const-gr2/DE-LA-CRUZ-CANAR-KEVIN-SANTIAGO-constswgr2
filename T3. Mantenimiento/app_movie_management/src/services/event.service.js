const axios = require('axios');

const { eventManagerUrl } = require('../config/env');
const { logger } = require('../utils/logger');

async function enviarEvento(evento) {
  const action = String(evento?.action ?? '').trim().toUpperCase();
  const description = String(evento?.description ?? '').trim();
  const title = String(evento?.title ?? '').trim();

  const eventoNormalizado = {
    source: String(evento?.source ?? 'app_movie_management').trim(),
    entity: String(evento?.entity ?? 'pelicula').trim(),
    action: action || 'QUERY',
    title: title || 'Evento sin titulo',
    description: description || 'Sin descripcion',
    payload: evento?.payload ?? {},
  };

  try {
    const response = await axios.post(eventManagerUrl, eventoNormalizado, {
      timeout: 4000,
      headers: { 'Content-Type': 'application/json' },
    });

    logger.info('Evento enviado al gestor de eventos', {
      action: eventoNormalizado.action,
      entity: eventoNormalizado.entity,
      title: eventoNormalizado.title,
    });

    return response.data;
  } catch (error) {
    logger.warn('No fue posible enviar el evento al gestor externo', {
      error: error.message,
      action: eventoNormalizado.action,
      entity: eventoNormalizado.entity,
    });
    return null;
  }
}

module.exports = {
  enviarEvento,
};