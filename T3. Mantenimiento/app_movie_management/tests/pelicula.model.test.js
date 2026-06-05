const { crearPelicula, validarDatosPelicula } = require('../src/models/pelicula.model');

describe('pelicula.model', () => {
  test('rechaza fechas calendario invalidas', () => {
    const resultado = validarDatosPelicula({
      titulo: 'Interstellar',
      director: 'Christopher Nolan',
      genero: 'Drama',
      anio: '2024-02-31',
    });

    expect(resultado.valido).toBe(false);
    expect(resultado.mensaje).toMatch(/fecha valida/i);
  });

  test('acepta datos validos y normaliza texto', () => {
    const pelicula = crearPelicula({
      id: '7',
      titulo: '  Inception  ',
      director: '  Christopher Nolan ',
      genero: 'Drama',
      anio: '2010-07-16',
    });

    expect(pelicula).toEqual({
      id: 7,
      titulo: 'Inception',
      director: 'Christopher Nolan',
      genero: 'Drama',
      anio: '2010-07-16',
    });
  });
});