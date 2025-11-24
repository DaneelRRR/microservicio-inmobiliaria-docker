const multer = require('multer');
const path = require('path');
const fs = require('fs');
const AdmZip = require('adm-zip');
const { getConnection, sql } = require('../config/db');

// --- Configuracion del gestor de archivos Multer ---
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const codigoBien = req.body.codigo_bien; 
        const tipoCarga = req.body.tipo; 
        let carpetaDestino = '';

        if (tipoCarga === 'original') carpetaDestino = path.join(__dirname, `../../uploads/${codigoBien}/100_originals`);
        else if (tipoCarga === 'editada') carpetaDestino = path.join(__dirname, `../../uploads/${codigoBien}/200_ok`);

        if (!fs.existsSync(carpetaDestino)) fs.mkdirSync(carpetaDestino, { recursive: true });
        cb(null, carpetaDestino);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({ storage: storage });

// --- Logica de Negocio ---
const controller = {};

controller.initDB = async (req, res) => {
    try {
        const pool = await getConnection();
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='Bienes' and xtype='U')
            CREATE TABLE Bienes (
                ID int IDENTITY(1,1) PRIMARY KEY,
                CodigoBien varchar(50) UNIQUE NOT NULL,
                Descripcion varchar(255),
                RutaGuardado varchar(255),
                FechaSubida datetime DEFAULT GETDATE()
            )
        `);
        res.send("Base de datos y Tabla inicializadas.");
    } catch (error) { res.status(500).send(error.message); }
};

controller.subirOriginales = async (req, res) => {
    const { codigo_bien, descripcion } = req.body;
    try {
        const pool = await getConnection();
        const result = await pool.request().input('Codigo', sql.VarChar, codigo_bien).query('SELECT * FROM Bienes WHERE CodigoBien = @Codigo');

        if (result.recordset.length === 0) {
            await pool.request()
                .input('Codigo', sql.VarChar, codigo_bien)
                .input('Desc', sql.VarChar, descripcion)
                .input('Ruta', sql.VarChar, `/uploads/${codigo_bien}`)
                .query('INSERT INTO Bienes (CodigoBien, Descripcion, RutaGuardado) VALUES (@Codigo, @Desc, @Ruta)');
        }
        res.json({ mensaje: "Archivos originales subidos correctamente." });
    } catch (error) { res.status(500).json({ error: error.message }); }
};

controller.subirEditadas = (req, res) => {
    const filePath = req.file.path;
    const folderPath = req.file.destination;
    try {
        if (req.file.mimetype.includes('zip') || req.file.originalname.endsWith('.zip')) {
            const zip = new AdmZip(filePath);
            zip.extractAllTo(folderPath, true);
            fs.unlinkSync(filePath); // Borrar zip
            res.json({ mensaje: "Pack descomprimido y publicado." });
        } else {
            res.json({ mensaje: "Foto individual guardada." });
        }
    } catch (error) { res.status(500).json({ error: error.message }); }
};

controller.obtenerBienes = async (req, res) => {
    try {
        const pool = await getConnection();
        const result = await pool.request().query('SELECT * FROM Bienes');
        
        const bienes = result.recordset.map(bien => {
            const pathEditadas = path.join(__dirname, `../../uploads/${bien.CodigoBien}/200_ok`);
            let fotos = [];
            if (fs.existsSync(pathEditadas)) {
                fotos = fs.readdirSync(pathEditadas)
                    .filter(file => file.match(/\.(jpg|jpeg|png|gif)$/i))
                    .map(file => ({ nombre: file, url: `/imagenes/${bien.CodigoBien}/200_ok/${file}` }));
            }
            return { ...bien, fotos_editadas: fotos };
        });
        res.json(bienes);
    } catch (error) { res.status(500).json({ error: error.message }); }
};

controller.actualizarDescripcion = async (req, res) => {
    const { codigo } = req.params;
    const { nueva_descripcion } = req.body;
    
    try {
        const pool = await getConnection();
        await pool.request()
            .input('Codigo', sql.VarChar, codigo)
            .input('Desc', sql.VarChar, nueva_descripcion)
            .query('UPDATE Bienes SET Descripcion = @Desc WHERE CodigoBien = @Codigo');
            
        res.json({ mensaje: `Descripción de ${codigo} actualizada correctamente.` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

module.exports = { controller, upload };