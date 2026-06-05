const apiUrl = '/peliculas';
const apiKeyStorageKey = 'fisEpnApiKey';
const defaultApiKey = 'FIS-EPN-2026';

const apiKeyInput = document.getElementById('apiKey');
const movieForm = document.getElementById('movieForm');
const movieIdInput = document.getElementById('movieId');
const tituloInput = document.getElementById('titulo');
const directorInput = document.getElementById('director');
const generoInput = document.getElementById('genero');
const anioInput = document.getElementById('anio');
const formTitle = document.getElementById('formTitle');
const resetButton = document.getElementById('resetButton');
const reloadButton = document.getElementById('reloadButton');
const searchInput = document.getElementById('searchInput');
const totalMovies = document.getElementById('totalMovies');
const visibleMovies = document.getElementById('visibleMovies');
const resultsSummary = document.getElementById('resultsSummary');
const messageBox = document.getElementById('message');
const moviesTableBody = document.getElementById('moviesTableBody');
const emptyState = document.getElementById('emptyState');

let peliculas = [];
let searchQuery = '';

function cargarApiKeyGuardada() {
  const apiKeyGuardada = localStorage.getItem(apiKeyStorageKey) || defaultApiKey;
  apiKeyInput.value = apiKeyGuardada;
  return apiKeyGuardada;
}

function obtenerApiKey() {
  const apiKey = String(apiKeyInput.value || '').trim();
  return apiKey || defaultApiKey;
}

function guardarApiKey() {
  localStorage.setItem(apiKeyStorageKey, obtenerApiKey());
}

function crearCeldaTexto(fila, texto) {
  const celda = document.createElement('td');
  celda.textContent = texto;
  fila.appendChild(celda);
}

function mostrarMensaje(texto, tipo = '') {
  messageBox.textContent = texto;
  messageBox.className = `message ${tipo}`.trim();

  if (!texto) {
    messageBox.className = 'message';
  }
}

function limpiarFormulario() {
  movieIdInput.value = '';
  movieForm.reset();
  formTitle.textContent = 'Agregar pelicula';
  movieForm.querySelector('button[type="submit"]').textContent = 'Guardar pelicula';
}

function normalizarTexto(valor) {
  return String(valor || '')
    .trim()
    .toLowerCase();
}

function formatearFechaVisual(fechaISO) {
  const [anio, mes, dia] = String(fechaISO || '').split('-');

  if (!anio || !mes || !dia) {
    return String(fechaISO || '');
  }

  return `${dia}/${mes}/${anio}`;
}

function filtrarPeliculas() {
  if (!searchQuery) {
    return peliculas;
  }

  return peliculas.filter((pelicula) => {
    const texto = `${pelicula.titulo} ${pelicula.director} ${pelicula.genero} ${pelicula.anio}`;
    return normalizarTexto(texto).includes(searchQuery);
  });
}

function actualizarResumen(listaVisible) {
  if (totalMovies) {
    totalMovies.textContent = String(peliculas.length);
  }

  if (visibleMovies) {
    visibleMovies.textContent = String(listaVisible.length);
  }

  if (resultsSummary) {
    resultsSummary.textContent =
      listaVisible.length === 1 ? '1 resultado' : `${listaVisible.length} resultados`;
  }
}

function llenarFormulario(pelicula) {
  movieIdInput.value = pelicula.id;
  tituloInput.value = pelicula.titulo;
  directorInput.value = pelicula.director;
  generoInput.value = pelicula.genero;
  anioInput.value = pelicula.anio;
  formTitle.textContent = 'Editar pelicula';
  movieForm.querySelector('button[type="submit"]').textContent = 'Actualizar pelicula';
  tituloInput.focus();
}

function renderizarPeliculas(lista) {
  moviesTableBody.innerHTML = '';

  if (!lista.length) {
    emptyState.querySelector('h3').textContent = searchQuery
      ? 'No encontramos coincidencias'
      : 'No hay peliculas registradas';
    emptyState.querySelector('p').textContent = searchQuery
      ? 'Prueba con otro termino o limpia el buscador para ver todo el catalogo.'
      : 'Agrega la primera pelicula usando el formulario o cambia el filtro de busqueda.';
    emptyState.classList.remove('hidden');
    actualizarResumen(lista);
    return;
  }

  emptyState.classList.add('hidden');
  actualizarResumen(lista);

  lista.forEach((pelicula) => {
    const fechaFormateada = formatearFechaVisual(pelicula.anio);

    const fila = document.createElement('tr');

    crearCeldaTexto(fila, pelicula.titulo);
    crearCeldaTexto(fila, pelicula.director);
    crearCeldaTexto(fila, pelicula.genero);
    crearCeldaTexto(fila, fechaFormateada);

    const acciones = document.createElement('td');
    const contenedorAcciones = document.createElement('div');
    contenedorAcciones.className = 'row-actions';

    const botonEditar = document.createElement('button');
    botonEditar.className = 'action-button edit';
    botonEditar.type = 'button';
    botonEditar.dataset.action = 'edit';
    botonEditar.dataset.id = String(pelicula.id);
    botonEditar.textContent = 'Editar';

    const botonEliminar = document.createElement('button');
    botonEliminar.className = 'action-button delete';
    botonEliminar.type = 'button';
    botonEliminar.dataset.action = 'delete';
    botonEliminar.dataset.id = String(pelicula.id);
    botonEliminar.textContent = 'Eliminar';

    contenedorAcciones.append(botonEditar, botonEliminar);
    acciones.appendChild(contenedorAcciones);
    fila.appendChild(acciones);

    moviesTableBody.appendChild(fila);
  });
}

function crearHeadersPeticion() {
  return {
    'Content-Type': 'application/json',
    'X-FIS-EPN-KEY': obtenerApiKey(),
  };
}

async function cargarPeliculas() {
  try {
    const respuesta = await fetch(apiUrl, {
      headers: crearHeadersPeticion(),
    });

    if (!respuesta.ok) {
      const data = await respuesta.json().catch(() => ({}));
      throw new Error(data.message || 'No fue posible cargar las peliculas.');
    }

    peliculas = await respuesta.json();
    renderizarPeliculas(filtrarPeliculas());
    mostrarMensaje('Biblioteca sincronizada.', 'success');
  } catch (error) {
    mostrarMensaje(error.message, 'error');
  }
}

async function guardarPelicula(evento) {
  evento.preventDefault();

  const payload = {
    titulo: tituloInput.value.trim(),
    director: directorInput.value.trim(),
    genero: generoInput.value.trim(),
    anio: anioInput.value,
  };

  const id = movieIdInput.value;
  const esEdicion = Boolean(id);
  const metodo = esEdicion ? 'PUT' : 'POST';
  const endpoint = esEdicion ? `${apiUrl}/${id}` : apiUrl;

  try {
    const respuesta = await fetch(endpoint, {
      method: metodo,
      headers: crearHeadersPeticion(),
      body: JSON.stringify(payload),
    });

    const data = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(data.message || 'No fue posible guardar la pelicula.');
    }

    mostrarMensaje(esEdicion ? 'Pelicula actualizada correctamente.' : 'Pelicula creada correctamente.', 'success');
    limpiarFormulario();
    await cargarPeliculas();
  } catch (error) {
    mostrarMensaje(error.message, 'error');
  }
}

async function eliminarPelicula(id) {
  const confirmacion = window.confirm('¿Deseas eliminar esta pelicula?');

  if (!confirmacion) {
    return;
  }

  try {
    const respuesta = await fetch(`${apiUrl}/${id}`, {
      method: 'DELETE',
      headers: {
        'X-FIS-EPN-KEY': obtenerApiKey(),
      },
    });

    const data = await respuesta.json();

    if (!respuesta.ok) {
      throw new Error(data.message || 'No fue posible eliminar la pelicula.');
    }

    mostrarMensaje('Pelicula eliminada correctamente.', 'success');
    if (movieIdInput.value === String(id)) {
      limpiarFormulario();
    }
    await cargarPeliculas();
  } catch (error) {
    mostrarMensaje(error.message, 'error');
  }
}

moviesTableBody.addEventListener('click', (evento) => {
  const boton = evento.target.closest('button[data-action]');

  if (!boton) {
    return;
  }

  const id = Number(boton.dataset.id);
  const pelicula = peliculas.find((item) => Number(item.id) === id);

  if (boton.dataset.action === 'edit' && pelicula) {
    llenarFormulario(pelicula);
  }

  if (boton.dataset.action === 'delete') {
    eliminarPelicula(id);
  }
});

movieForm.addEventListener('submit', guardarPelicula);
apiKeyInput.addEventListener('input', guardarApiKey);
resetButton.addEventListener('click', () => {
  limpiarFormulario();
  mostrarMensaje('Formulario limpio.', 'success');
});
reloadButton.addEventListener('click', cargarPeliculas);
searchInput.addEventListener('input', (evento) => {
  searchQuery = normalizarTexto(evento.target.value);
  renderizarPeliculas(filtrarPeliculas());
});

cargarApiKeyGuardada();
cargarPeliculas();