const { enviarEvento } = require('../services/event.service');
const { logger } = require('../utils/logger');

const { validarDatosPelicula } = require('../models/pelicula.model');
const {
  obtenerPeliculas: obtenerPeliculasDesdeBaseDatos,
  obtenerPeliculaPorId: obtenerPeliculaEnBaseDatos,
  crearPeliculaEnBaseDatos,
  actualizarPeliculaEnBaseDatos,
  eliminarPeliculaDeBaseDatos,
} = require('../services/pelicula.storage');

function registrarEventoNoBloqueante(evento) {
  void enviarEvento(evento);
}

async function registrarEventoEliminacionConRespaldo(peliculaEliminada, id) {
  await enviarEvento({
    source: 'app_movie_management',
    entity: 'pelicula',
    action: 'DELETE',
    title: 'Pelicula eliminada',
    description: `Se eliminó la pelicula id ${id}.`,
    payload: peliculaEliminada || { id },
  });

  await enviarEvento({
    source: 'app_movie_management',
    entity: 'pelicula',
    action: 'QUERY',
    title: 'Auditoria de eliminacion de pelicula',
    description: `Se registro la eliminacion de la pelicula id ${id}.`,
    payload: peliculaEliminada || { id },
  });
}

async function obtenerPeliculas(req, res, next) {
  try {
    const peliculas = obtenerPeliculasDesdeBaseDatos();

    logger.info('Consulta de peliculas ejecutada', {
      total: peliculas.length,
    });

    registrarEventoNoBloqueante({
      source: 'app_movie_management',
      entity: 'pelicula',
      action: 'QUERY',
      title: 'Peliculas obtenidas',
      description: `Se han obtenido ${peliculas.length} peliculas.`,
      payload: { cantidad: peliculas.length },
    });

    res.json(peliculas);
  } catch (error) {
    next(error);
  }
}

async function obtenerPeliculaPorId(req, res, next) {
  try {
    const id = Number(req.params.id);
    const pelicula = obtenerPeliculaEnBaseDatos(id);

    if (!pelicula) {
      logger.warn('Consulta por id sin coincidencias', {
        id,
      });
      return res.status(404).json({ message: 'Pelicula no encontrada' });
    }

    logger.info('Pelicula consultada por id', {
      id,
      titulo: pelicula.titulo,
    });

    registrarEventoNoBloqueante({
      source: 'app_movie_management',
      entity: 'pelicula',
      action: 'QUERY',
      title: `Pelicula obtenida: ${pelicula.titulo}`,
      description: `Se ha obtenido la pelicula "${pelicula.titulo}" dirigida por ${pelicula.director}.`,
      payload: pelicula,
    });

    res.json(pelicula);
  } catch (error) {
    next(error);
  }
}

async function crearPeliculaHandler(req, res, next) {
  try {
    const validacion = validarDatosPelicula(req.body);

    if (!validacion.valido) {
      logger.warn('Intento de crear pelicula con datos invalidos', {
        error: validacion.mensaje,
      });
      return res.status(400).json({ message: validacion.mensaje });
    }

    const nuevaPelicula = crearPeliculaEnBaseDatos(validacion.datos);

    logger.info('Pelicula creada correctamente', {
      id: nuevaPelicula.id,
      titulo: nuevaPelicula.titulo,
    });

    registrarEventoNoBloqueante({
      source: 'app_movie_management',
      entity: 'pelicula',
      action: 'CREATE',
      title: `Pelicula creada: ${nuevaPelicula.titulo}`,
      description: `Se ha creado la pelicula "${nuevaPelicula.titulo}" dirigida por ${nuevaPelicula.director}.`,
      payload: nuevaPelicula,
    });

    res.status(201).json(nuevaPelicula);
  } catch (error) {
    next(error);
  }
}

async function actualizarPelicula(req, res, next) {
  try {
    const id = Number(req.params.id);
    const validacion = validarDatosPelicula(req.body);

    if (!validacion.valido) {
      logger.warn('Intento de actualizar pelicula con datos invalidos', {
        id,
        error: validacion.mensaje,
      });
      return res.status(400).json({ message: validacion.mensaje });
    }

    const peliculaExistente = obtenerPeliculaEnBaseDatos(id);

    if (!peliculaExistente) {
      logger.warn('Intento de actualizar pelicula inexistente', {
        id,
      });
      return res.status(404).json({ message: 'Pelicula no encontrada' });
    }

    const peliculaActualizada = actualizarPeliculaEnBaseDatos(id, validacion.datos);

    registrarEventoNoBloqueante({
      source: 'app_movie_management',
      entity: 'pelicula',
      action: 'UPDATE',
      title: `Pelicula actualizada: ${peliculaActualizada.titulo}`,
      description: `Se ha actualizado la pelicula "${peliculaActualizada.titulo}" dirigida por ${peliculaActualizada.director}.`,
      payload: peliculaActualizada,
    });

    res.json(peliculaActualizada);
  } catch (error) {
    next(error);
  }
}

async function eliminarPelicula(req, res, next) {
  try {
    const id = Number(req.params.id);
    const peliculaEliminada = eliminarPeliculaDeBaseDatos(id);

    if (!peliculaEliminada) {
      logger.warn('Intento de eliminar pelicula inexistente', {
        id,
      });
      return res.status(404).json({ message: 'Pelicula no encontrada' });
    }

    void registrarEventoEliminacionConRespaldo(peliculaEliminada, id);

    res.json({ message: 'Pelicula eliminada correctamente' });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  obtenerPeliculas,
  obtenerPeliculaPorId,
  crearPelicula: crearPeliculaHandler,
  actualizarPelicula,
  eliminarPelicula,
};