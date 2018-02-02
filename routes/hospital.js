const express = require('express');
const app = express();
// import mongoDB schema // This will allow you to use the schema 
const Hospital = require('../models/hospital');
const mdAutenticacion = require('../middlewares/autenticacion');

// ==================================================
//       Obtener todos los hospitales 
// ==================================================

app.get('/', (req, res, next) => {
    // Agrega la paginacion desde mongoose
    let desde = req.query.desde || 0;
    desde = Number(desde);
    // Use the Mongo Schema / Find the user
    // Display only declared fields
    Hospital.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .exec(
            (err, hospitales) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando hospitales',
                        error: err
                    });
                }

                Hospital.count({}, (err, conteo) => {
                    res.status(200).json({
                        ok: true,
                        hospitales: hospitales,
                        total: conteo
                    });
                });
            });
});


// ==================================================
//       Actualizar hospital 
// ==================================================

app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    const id = req.params.id;
    const body = req.body;

    Hospital.findById(id, (err, hospital) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar hospital',
                errors: err
            });
        }

        if (!hospital) {
            return res.status(400).json({
                ok: false,
                mensaje: `El hospital con el id ${id} no existe `,
                errors: { message: 'No existe un hospital con este ID' }
            });
        }

        hospital.nombre = body.nombre;
        // Obtener el usuario id cual actualizo el post
        hospital.usuario = req.usuario._id;


        hospital.save((err, hospitalGuardado) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar hospital',
                    errors: err
                });
            }

            res.status(200).json({
                ok: true,
                hospital: hospitalGuardado
            });
        });
    });
})

// ==================================================
//       Crear un nuevo hospital 
// ==================================================

// Middleware se puede agregar como un array tambien
app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    // Extraer la informacion del body desde el post
    const body = req.body;
    const hospital = new Hospital({
        nombre: body.nombre,
        usuario: req.usuario._id
    })

    // Guardar la informacion extraida en MongoDB
    hospital.save((err, hospitalGuardado) => {
        // Si hay un error
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear hospital',
                errors: err
            });
        }
        // Si es exitoso
        res.status(201).json({
            ok: true,
            hospital: hospitalGuardado
        })

    });
});

// ==================================================
//       Borrar un hospital por el id 
// ==================================================

app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    const id = req.params.id;

    Hospital.findByIdAndRemove(id, (err, hospitalBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar hospital',
                errors: err
            });
        }

        if (!hospitalBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe ese hospital con ese ID',
                errors: { message: 'No existe un hospital con ese ID' }
            });
        }

        res.status(200).json({
            ok: true,
            hospital: hospitalBorrado,
        });

    })

})

module.exports = app;