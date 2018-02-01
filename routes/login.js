// Requerimientos
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const SEED = require('../config/config').SEED;
// Inicializar variables
const app = express();
const Usuario = require('../models/usuario');



app.post('/', (req, res) => {
    // Recibir el request body de la peticion
    const body = req.body;

    Usuario.findOne({ email: body.email }, (err, usuarioDB) => {
        // Si hay un error con la peticion
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al crear al buscar usuarios',
                errors: err
            });
        }
        // Verificar si el email es correcto
        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - email',
                errors: err
            });
        }
        // Verificar si la contraseña es valida
        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - password',
                errors: err
            });
        }

        // Esconder el password
        usuarioDB.password = ':)';
        // Si usuario y contraseña son correctos = TOKEN
        // Payload es el usuario + el secret key + expiracion en 4 horas
        const token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 });

        res.status(200).json({
            ok: true,
            usuario: usuarioDB,
            token: token,
            id: usuarioDB._id
        });

    })
});


module.exports = app;