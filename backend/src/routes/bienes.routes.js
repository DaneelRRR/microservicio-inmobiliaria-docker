const { Router } = require('express');
const { controller, upload } = require('../controllers/bienes.controller');

const router = Router();

// Rutas API
router.get('/init-db', controller.initDB);
router.get('/bienes', controller.obtenerBienes);

// Rutas de subida
router.post('/fotografo/upload', upload.single('archivo'), controller.subirOriginales);
router.post('/grafista/upload', upload.single('archivo'), controller.subirEditadas);

// Ruta de actualizacion
router.put('/bienes/:codigo', controller.actualizarDescripcion);

module.exports = router;