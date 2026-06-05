const MAX_TEXTO = 120;
const MAX_GENERO = 40;

const generosPermitidos = new Set([
  'Accion',
  'Aventura',
  'Ciencia ficcion',
  'Drama',
  'Comedia',
  'Terror',
  'Romance',
  'Animacion',
  'Suspenso',
  'Fantasia',
]);

function sanitizarTexto(valor) {
  return String(valor || '')
    .replace(/\s+/g, ' ')
    .trim();
}

function recortarTexto(valor, limite) {
  return sanitizarTexto(valor).slice(0, limite);
}

function esFechaValida(valor) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
    return false;
  }

  const [anio, mes, dia] = valor.split('-').map(Number);
  const fecha = new Date(Date.UTC(anio, mes - 1, dia));

  return (
    fecha.getUTCFullYear() === anio &&
    fecha.getUTCMonth() === mes - 1 &&
    fecha.getUTCDate() === dia
  );
}

function normalizarFecha(valor) {
  const texto = recortarTexto(valor, 10);

  if (esFechaValida(texto)) {
    return texto;
  }

  const anio = Number(texto);
  if (Number.isInteger(anio) && anio >= 1888 && anio <= 2100) {
    return `${anio}-01-01`;
  }

  return '';
}

function validarDatosPelicula(datos) {
  const titulo = recortarTexto(datos?.titulo, MAX_TEXTO);
  const director = recortarTexto(datos?.director, MAX_TEXTO);
  const genero = recortarTexto(datos?.genero, MAX_GENERO);
  const anio = normalizarFecha(datos?.anio);

  if (!titulo || !director || !genero || !anio) {
    return {
      valido: false,
      mensaje: 'Completa titulo, director, genero y una fecha valida.',
    };
  }

  if (!generosPermitidos.has(genero)) {
    return {
      valido: false,
      mensaje: 'El genero no esta permitido por el catalogo.',
    };
  }

  return {
    valido: true,
    datos: {
      titulo,
      director,
      genero,
      anio,
    },
  };
}

function crearPelicula(datos) {
  return {
    id: Number(datos.id),
    titulo: recortarTexto(datos.titulo, MAX_TEXTO),
    director: recortarTexto(datos.director, MAX_TEXTO),
    genero: recortarTexto(datos.genero, MAX_GENERO),
    anio: normalizarFecha(datos.anio),
  };
}

module.exports = {
  validarDatosPelicula,
  crearPelicula,
};