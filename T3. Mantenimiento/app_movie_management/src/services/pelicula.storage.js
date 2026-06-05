const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const { logger } = require('../utils/logger');
const { crearPelicula } = require('../models/pelicula.model');
const { dataDir, dbPath, legacyPath } = require('../config/env');

let database;

function asegurarBaseDeDatos() {
  if (database) {
    return database;
  }

  fs.mkdirSync(dataDir, { recursive: true });

  database = new Database(dbPath);
  database.pragma('journal_mode = WAL');
  database.exec(`
    CREATE TABLE IF NOT EXISTS peliculas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      titulo TEXT NOT NULL,
      director TEXT NOT NULL,
      genero TEXT NOT NULL,
      anio TEXT NOT NULL
    );
  `);

  const total = database.prepare('SELECT COUNT(*) AS total FROM peliculas').get().total;

  if (total === 0 && fs.existsSync(legacyPath)) {
    try {
      const contenido = fs.readFileSync(legacyPath, 'utf8');

      if (contenido.trim()) {
        const peliculas = JSON.parse(contenido);

        if (Array.isArray(peliculas) && peliculas.length > 0) {
          const insertar = database.prepare(`
            INSERT INTO peliculas (id, titulo, director, genero, anio)
            VALUES (@id, @titulo, @director, @genero, @anio)
          `);

          const transaccion = database.transaction((items) => {
            for (const pelicula of items) {
              insertar.run(crearPelicula(pelicula));
            }
          });

          transaccion(peliculas);
        }
      }
    } catch (error) {
      logger.error('No fue posible migrar el archivo legado de peliculas', {
        error: error.message,
      });
    }
  }

  return database;
}

function cerrarBaseDeDatos() {
  if (!database) {
    return;
  }

  database.close();
  database = undefined;
}

function normalizarFila(fila) {
  return fila ? crearPelicula(fila) : null;
}

function obtenerPeliculas() {
  const db = asegurarBaseDeDatos();
  return db.prepare('SELECT id, titulo, director, genero, anio FROM peliculas ORDER BY id ASC').all().map(crearPelicula);
}

function obtenerPeliculaPorId(id) {
  const db = asegurarBaseDeDatos();
  const fila = db
    .prepare('SELECT id, titulo, director, genero, anio FROM peliculas WHERE id = ?')
    .get(Number(id));

  return normalizarFila(fila);
}

function obtenerSiguienteId() {
  const db = asegurarBaseDeDatos();
  const fila = db.prepare('SELECT COALESCE(MAX(id), 0) + 1 AS siguienteId FROM peliculas').get();

  return Number(fila?.siguienteId) || 1;
}

function crearPeliculaEnBaseDatos(pelicula) {
  const db = asegurarBaseDeDatos();
  const peliculaNormalizada = crearPelicula(pelicula);

  const resultado = db.prepare(`
    INSERT INTO peliculas (titulo, director, genero, anio)
    VALUES (@titulo, @director, @genero, @anio)
  `).run(peliculaNormalizada);

  return obtenerPeliculaPorId(resultado.lastInsertRowid);
}

function actualizarPeliculaEnBaseDatos(id, pelicula) {
  const db = asegurarBaseDeDatos();
  const peliculaNormalizada = crearPelicula({ ...pelicula, id });

  const resultado = db.prepare(`
    UPDATE peliculas
    SET titulo = @titulo,
        director = @director,
        genero = @genero,
        anio = @anio
    WHERE id = @id
  `).run(peliculaNormalizada);

  if (resultado.changes === 0) {
    return null;
  }

  return obtenerPeliculaPorId(id);
}

function eliminarPeliculaDeBaseDatos(id) {
  const pelicula = obtenerPeliculaPorId(id);

  if (!pelicula) {
    return null;
  }

  const db = asegurarBaseDeDatos();
  db.prepare('DELETE FROM peliculas WHERE id = ?').run(Number(id));

  return pelicula;
}

module.exports = {
  asegurarBaseDeDatos,
  cerrarBaseDeDatos,
  obtenerPeliculas,
  obtenerPeliculaPorId,
  obtenerSiguienteId,
  crearPeliculaEnBaseDatos,
  actualizarPeliculaEnBaseDatos,
  eliminarPeliculaDeBaseDatos,
};