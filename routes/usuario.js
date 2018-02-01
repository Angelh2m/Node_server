const express = require('express');
const bcrypt = require('bcrypt');
const app = express();
// JSON web token
const jwt = require('jsonwebtoken');
const SEED = require('../config/config').SEED;
// import mongoDB schema // This will allow you to use the schema 
const Usuario = require('../models/usuario');
const mdAutenticacion = require('../middlewares/autenticacion');

// ==================================================
//       Obtener todos los usuarios 
// ==================================================

app.get('/', (req, res, next) => {

    // Use the Mongo Schema / Find the user
    // Display only declared fields
    Usuario.find({}, 'nombre email imagen role')
        .exec(
            (err, usuarios) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error cargando usuarios',
                        error: err
                    });
                }

                res.status(200).json({
                    ok: true,
                    usuarios: usuarios
                });

            });


});

// ==================================================
//       Verificar Token = Middleware 
// ==================================================

app.use('/', (req, res, next) => {
    // Agaramos del URL el token
    const token = req.query.token;

    jwt.verify(token, SEED, (err, decoded) => {

        if (err) {
            return res.status(401).json({
                ok: false,
                mensaje: 'Token incorrecto',
                error: err
            });
        }

        next();

    });
});

// ==================================================
//       Actualizar usuario 
// ==================================================

app.put('/:id', mdAutenticacion.verificaToken, (req, res) => {

    const id = req.params.id;
    const body = req.body;

    Usuario.findById(id, (err, usuario) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar usuario',
                errors: err
            });
        }

        if (!usuario) {
            return res.status(400).json({
                ok: false,
                mensaje: `El usuario con el id ${id} no existe `,
                errors: { message: 'No existe un usuario con este ID' }
            });
        }

        usuario.nombre = body.nombre;
        usuario.email = body.email;
        usuario.role = body.role;


        usuario.save((err, usuarioGuardado) => {

            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar usuario',
                    errors: err
                });
            }

            usuarioGuardado.password = ':)';

            res.status(200).json({
                ok: true,
                usuario: usuarioGuardado
            });
        });
    });
})

// ==================================================
//       Crear un nuevo usuario 
// ==================================================

// Middleware se puede agregar como un array tambien
app.post('/', mdAutenticacion.verificaToken, (req, res) => {

    // Extraer la informacion del body desde el post
    const body = req.body;
    const usuario = new Usuario({
        nombre: body.nombre,
        email: body.email,
        password: bcrypt.hashSync(body.password, 10),
        role: body.role
    })

    // Guardar la informacion extraida en MongoDB
    usuario.save((err, usuarioGuardado) => {
        // Si hay un error
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear usuario',
                errors: err
            });
        }
        // Si es exitoso
        res.status(201).json({
            ok: true,
            usuario: usuarioGuardado,
            usuarioToken: req.usuario
        })

    });
});

// ==================================================
//       Borrar un usuario por el id 
// ==================================================

app.delete('/:id', mdAutenticacion.verificaToken, (req, res) => {

    const id = req.params.id;

    Usuario.findByIdAndRemove(id, (err, usuarioBorrado) => {

        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al borrar usuario',
                errors: err
            });
        }

        if (!usuarioBorrado) {
            return res.status(400).json({
                ok: false,
                mensaje: 'No existe ese usuario con ese ID',
                errors: { message: 'No existe un usuario con ese ID' }
            });
        }

        res.status(200).json({
            ok: true,
            usuario: usuarioBorrado,
        });

    })

})

module.exports = app;