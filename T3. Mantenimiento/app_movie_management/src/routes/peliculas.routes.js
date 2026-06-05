const express = require('express');

const peliculasController = require('../controllers/peliculas.controller');
const { validarApiKey } = require('../middlewares/apiKey.middleware');

const router = express.Router();

router.use(validarApiKey);

router.get('/', peliculasController.obtenerPeliculas);
router.get('/:id', peliculasController.obtenerPeliculaPorId);
router.post('/', peliculasController.crearPelicula);
router.put('/:id', peliculasController.actualizarPelicula);
router.delete('/:id', peliculasController.eliminarPelicula);

module.exports = router;