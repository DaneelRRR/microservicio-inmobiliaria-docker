const sql = require('mssql');

const masterConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PWD,
    server: process.env.DB_SERVER,
    database: 'master',
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

// Configuracion de conexion
const dbConfig = {
    ...masterConfig,
    database: process.env.DB_NAME // Lee del docker-compose
};

async function createDatabaseIfNotExists() {
    try {
        // Nos conectamos a MASTER
        const pool = await new sql.ConnectionPool(masterConfig).connect();
        
        // Preguntamos si existe la base de datos
        const dbName = process.env.DB_NAME;
        const result = await pool.request().query(`SELECT name FROM sys.databases WHERE name = '${dbName}'`);
        
        // Si no existe se crea la base de datos
        if (result.recordset.length === 0) {
            console.log(`La base de datos ${dbName} no existe. Creándola...`);
            await pool.request().query(`CREATE DATABASE ${dbName}`);
            console.log(`Base de datos ${dbName} creada con éxito.`);
        }
        
        pool.close();
    } catch (error) {
        console.error("Error al intentar crear la base de datos:", error);
    }
}

async function getConnection() {
    try {
        // asegurar que la BD exista
        await createDatabaseIfNotExists();

        // conexion a InmobiliariaDB
        const pool = await sql.connect(dbConfig);
        return pool;
    } catch (error) {
        console.error('Error de conexión:', error);
        throw error;
    }
}

module.exports = { getConnection, sql };