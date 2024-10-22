const express = require('express');
const fileUpload = require('express-fileupload');
const path = require('path');
const fs = require('fs');
const { error } = require('console');

//Crear la app de Express
const app = express();

//Middleware para el manejo de la subida de archivos
app.use(fileUpload());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

//Servir archivos estáticos (Bootstrap y las vistas HTML)
app.use(express.static('public'));

//Cargar las vistas (páginas)
//Todas las páginas web que visitamos se cargan con un GET
//4 primero endpoints para cargar las vistas 
//QUE consumirán nuestros endpoints funcionales.

app.get('/', (req, res) => {
    console.log(convertEpochToSpecificTimezone(1729596675127, -4));
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/files-view', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'files.html'));
});

app.get('/rename-view', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'rename.html'));
});

app.get('/delete-view', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'delete.html'));
});


//Ruta para descargar Archivos

app.get('/descargar/:name', async (req,res)=>{
    const nombreArchivo = req.params.name;
    const rutaArchivo = path.join(__dirname, 'uploads', nombreArchivo);

    res.download(rutaArchivo, (error)=>{
        if(error){
            res.status(500).send({
                message: 'Error al descargar el archivo',
                error: true,
                mensaje: 'No se puede descargar el archivo solicitado',
                nombreArchivo: nombreArchivo
            })
        }
    })

});

//Ruta para subir archivos
app.post('/upload', (req, res) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send({
            code: 400,
            error: true,
            mensaje: 'No se subió ningún archivo.'
        });
    }

    const archivo = req.files.archivo;
    const timestamp = Date.now();
    const nuevoNombre = `${timestamp}${path.extname(archivo.name)}`;
    const uploadPath = path.join(__dirname, 'uploads', nuevoNombre);

    archivo.mv(uploadPath, (err) => {
        if (err) {
            return res.status(500).send('Error al subir el archivo.');
        }
        res.status(200).send({
            error: false,
            code: 200,
            mensaje: `Archivo subido`,
            nombreArchivo: nuevoNombre,
            fecha: Date.now()
        });
    });
});

//Ruta para listar archivos en la carpeta "uploads"
app.get('/files', (req, res) => {
    const uploadDir = path.join(__dirname, 'uploads');

    fs.readdir(uploadDir, (err, files) => {
        console.log(files);
        if (err) {
            return res.status(500).send({
                code: 500,
                error: true,
                mensaje: 'Error al listar archivos',
                files: []
            });
        }
        res.status(200).json({ archivos: files });
    });
});

//Ruta para renombrar un archivo
app.post('/rename', (req, res) => {
    const { viejoNombre, nuevoNombre } = req.body;

    const oldPath = path.join(__dirname, 'uploads', viejoNombre);
    const newPath = path.join(__dirname, 'uploads', nuevoNombre);

    try {
        fs.renameSync(oldPath, newPath);
        res.status(200).send(`Archivo renombrado de ${viejoNombre} a ${nuevoNombre}`);
    } catch (err) {
        res.status(500).send('Error al renombrar el archivo.');
    }
});

//Ruta para eliminar un archivo
app.post('/delete', (req, res) => {
    const { nombreArchivo } = req.body;
    const filePath = path.join(__dirname, 'uploads', nombreArchivo);

    try {
        fs.unlinkSync(filePath);
        res.status(200).send(`Archivo ${nombreArchivo} eliminado con éxito.`);
    } catch (err) {
        res.status(500).send('Error al eliminar el archivo.');
    }
});

function convertEpochToSpecificTimezone(timeEpoch, offset){
    var d = new Date(timeEpoch);
    var utc = d.getTime() + (d.getTimezoneOffset() * 60000);  //This converts to UTC 00:00
    var nd = new Date(utc + (3600000*offset));
    return nd.toLocaleString();
}


//Iniciar el servidor
app.listen(3000, () => {
    console.log('Servidor iniciado en http://localhost:3000');
});
