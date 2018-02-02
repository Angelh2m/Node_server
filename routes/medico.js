const express = require('express');
const app = express();
// import mongoDB schema // This will allow you to use the schema 
const Medico = require('../models/medico');
const mdAutenticacion = require('../middlewares/autenticacion');

// ==================================================
//       Obtener todos los medicos 
// ==================================================

app.get('/', (req, res, next) => {
    // Agrega la paginacion desde mongoose
    let desde = req.query.desde || 0;
    desde = Number(desde);
    // Use the Mongo Schema / Find the user
    // Display only declared fields
    Medico.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec(
            (err, medicos) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando medicos',
                        error: err
                    });
                }

                Medico.count({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        medicos: medicos,
                        total: conteo
                    });
                })

            });


});


// ==================================================
//       Actualizar medico 
// ==================================================

app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    const id = req.params.id;
    const body = req.body;

    Medico.findById(id, (err, medico) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar medico',
                errors: err
            });
        }

        if (!medico) {
            return res.status(400).json({
                ok: false,
                mensaje: `El medico con el id ${id} no existe `,
                errors: { message: 'No existe un medico con este ID' }
            });
        }

        medico.nombre = body.nombre;
        // Obtener el usuario id cual actualizo el post
        medico.usuario = req.usuario._id;
        medico.hospital = body.hospital;


        medico.save((err, medicoGuardado) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar medico',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                medico: medicoGuardado
            });
        });
    });
})

// ==================================================
//       Crear un nuevo medico 
// ==================================================

// Middleware se puede agregar como un array tambien
app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    // Extraer la informacion del body desde el post
    const body = req.body;
    const medico = new Medico({
        nombre: body.nombre,
        usuario: req.usuario._id,
        hospital: body.hospital
    })

    // Guardar la informacion extraida en MongoDB
    medico.save((err, medicoGuardado) => {
        // Si hay un error
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear medico',
                errors: err
            });
        }
        // Si es exitoso
        res.status(201).json({
            ok: true,
            medico: medicoGuardado
        })

    });
});

// ==================================================
//       Borrar un medico por el id 
// ==================================================

app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    const id = req.params.id;

    Medico.findByIdAndRemove(id, (err, medicoBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar medico',
                errors: err
            });
        }

        if (!medicoBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe ese medico con ese ID',
                errors: { message: 'No existe un medico con ese ID' }
            });
        }

        res.status(200).json({
            ok: true,
            medico: medicoBorrado,
        });

    })

})

module.exports = app;