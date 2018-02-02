const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();
// importar los modelos de mongo
const Usuario = require('../models/usuario');
const Medico = require('../models/medico');
const Hospital = require('../models/hospital');
// Adicionales
const fs = require('fs');

// default options
app.use(fileUpload());


// Rutas
app.put('/:tipo/:id', (req, res, next) => {

    const tipo = req.params.tipo;
    const id = req.params.id;

    const tiposValidos = ['usuarios', 'medicos', 'hospitales'];

    if (tiposValidos.indexOf(tipo) < 0) {
        return res.status(400).json({
            ok: false,
            mensaje: 'Tipo de coleccion no es valida',
            error: { message: 'Tipo de coleccion no es valida' }
        });
    }

    if (!req.files) {
        return res.status(400).json({
            ok: false,
            mensaje: 'No selecciono nada',
            error: { message: 'Debe selecionar una imagen' }
        });
    }


    // Obtener el nombre del archivo
    const archivo = req.files.imagen
    const nombreCortado = archivo.name.split('.');
    const extensionArchivo = nombreCortado[nombreCortado.length - 1];

    const extensionesValidas = ['png', 'jpg', 'gif', 'jpeg'];

    // Validacion de las extenciones
    if (extensionesValidas.indexOf(extensionArchivo) < 0) {
        res.status(400).json({
            ok: false,
            mensaje: 'Extension no valida',
            errors: { message: 'Las extensiones validas son: ' + extensionesValidas.join(', ') }
        });
    }

    // Nombre de archivo personalizado
    const nombrearchivo = `${ id }-${ new Date().getMilliseconds() }.${ extensionArchivo }`;

    // Mover el archivo de temporal al archivo

    const path = `./uploads/${ tipo }/${ nombrearchivo }`;

    archivo.mv(path, err => {

        if (err) {
            res.status(500).json({
                ok: false,
                mensaje: 'Error al mover archivo',
                extensionArchivo: extensionArchivo
            });
        }

        subirPorTipo(tipo, id, path, res);
    });
});

function subirPorTipo(tipo, id, nombreArchivo, res) {

    if (tipo === 'usuarios') {

        Usuario.findById(id, (err, usuario) => {

            if (!usuario) {
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Usuario no existe',
                    errors: { message: 'Usuario no existe' }
                });
            }

            // revisar el path viejo de la imagen
            let pathViejo = usuario.img;
            // Si existe borrar la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }
            // Agregar la nueva imagen
            usuario.img = nombreArchivo;
            // Guardar los cambios
            usuario.save((err, usuarioActualizado) => {

                usuarioActualizado.password = ':)';

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de usuario actualizada',
                    usuarioActualizado: usuarioActualizado,
                    pathViejo: pathViejo
                });
            });

        })

    }

    if (tipo === 'medicos') {

        Medico.findById(id, (err, medico) => {

            if (!medico) {
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Medico no existe',
                    errors: { message: 'Medico no existe' }
                });
            }
            // revisar el path viejo de la imagen
            let pathViejo = medico.img;
            // Si existe borrar la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }
            // Agregar la nueva imagen
            medico.img = nombreArchivo;
            // Guardar los cambios
            medico.save((err, medicoActualizado) => {

                medicoActualizado.password = ':)';

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de medico actualizada',
                    medicoActualizado: medicoActualizado
                });
            });

        })

    }

    if (tipo === 'hospitales') {

        Hospital.findById(id, (err, hospital) => {

            if (!hospital) {
                return res.status(200).json({
                    ok: true,
                    mensaje: 'Hospital no existe',
                    errors: { message: 'Hospital no existe' }
                });
            }
            // revisar el path viejo de la imagen
            let pathViejo = hospital.img;
            // Si existe borrar la imagen anterior
            if (fs.existsSync(pathViejo)) {
                fs.unlink(pathViejo);
            }
            // Agregar la nueva imagen
            hospital.img = nombreArchivo;
            // Guardar los cambios
            hospital.save((err, hospitalActualizado) => {

                hospitalActualizado.password = ':)';

                return res.status(200).json({
                    ok: true,
                    mensaje: 'Imagen de hospital actualizada',
                    hospitalActualizado: hospitalActualizado
                });
            });

        })
    }

}


module.exports = app;