const express = require('express');
const fs = require('fs');
const app = express();


// Rutas
app.get('/:tipo/:img', (req, res, next) => {

    const tipo = req.params.tipo;
    const img = req.params.img;

    let path = `./uploads/${ tipo }/${ img }`;
    // Revisar si el path existe en el sistema
    fs.exists(path, existe => {

        if (!existe) {
            path = './assets/no-img.jpg';
        }

        res.sendfile(path);

    });

    // res.status(200).json({
    //     ok: true,
    //     mensaje: 'Peticion realizada correctamente'
    // });
});


module.exports = app;