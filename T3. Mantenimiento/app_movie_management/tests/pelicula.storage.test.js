const fs = require('fs');
const os = require('os');
const path = require('path');

function cargarStorageTemporal() {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'peliculas-storage-'));
  const dbPath = path.join(tempDir, 'peliculas.sqlite');
  const legacyPath = path.join(tempDir, 'peliculas.json');

  process.env.PELICULAS_DATA_DIR = tempDir;
  process.env.PELICULAS_DB_PATH = dbPath;
  process.env.PELICULAS_LEGACY_PATH = legacyPath;

  jest.resetModules();

  const storage = require('../src/services/pelicula.storage');

  return { storage, tempDir };
}

describe('pelicula.storage', () => {
  afterEach(() => {
    if (currentStorage) {
      currentStorage.cerrarBaseDeDatos();
    }

    delete process.env.PELICULAS_DATA_DIR;
    delete process.env.PELICULAS_DB_PATH;
    delete process.env.PELICULAS_LEGACY_PATH;
    jest.resetModules();
  });

  let currentStorage;

  test('crea peliculas con ids unicos', () => {
    const { storage, tempDir } = cargarStorageTemporal();
    currentStorage = storage;

    const primera = storage.crearPeliculaEnBaseDatos({
      titulo: 'The Matrix',
      director: 'Lana Wachowski',
      genero: 'Ciencia ficcion',
      anio: '1999-03-31',
    });

    const segunda = storage.crearPeliculaEnBaseDatos({
      titulo: 'The Matrix Reloaded',
      director: 'Lana Wachowski',
      genero: 'Ciencia ficcion',
      anio: '2003-05-15',
    });

    expect(primera.id).not.toBe(segunda.id);
    expect(storage.obtenerPeliculas()).toHaveLength(2);

    storage.cerrarBaseDeDatos();
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  test('actualiza y elimina peliculas persistidas', () => {
    const { storage, tempDir } = cargarStorageTemporal();
    currentStorage = storage;

    const pelicula = storage.crearPeliculaEnBaseDatos({
      titulo: 'Batman',
      director: 'Tim Burton',
      genero: 'Accion',
      anio: '1989-06-23',
    });

    const actualizada = storage.actualizarPeliculaEnBaseDatos(pelicula.id, {
      titulo: 'Batman Returns',
      director: 'Tim Burton',
      genero: 'Accion',
      anio: '1992-06-19',
    });

    expect(actualizada.titulo).toBe('Batman Returns');

    const eliminada = storage.eliminarPeliculaDeBaseDatos(pelicula.id);

    expect(eliminada.id).toBe(pelicula.id);
    expect(storage.obtenerPeliculas()).toHaveLength(0);

    storage.cerrarBaseDeDatos();
    fs.rmSync(tempDir, { recursive: true, force: true });
  });
});