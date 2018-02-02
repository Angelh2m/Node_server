// Requerimientos
const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const SEED = require('../config/config').SEED;
// Inicializar variables
const app = express();
const Usuario = require('../models/usuario');
// Google sign in
const GoogleAuth = require('google-auth-library');
const auth = new GoogleAuth;
// Credenciales
const GOOGLE_CLIENT_ID = require('../config/config').GOOGLE_CLIENT_ID;
const GOOGLE_SECRET = require('../config/config').GOOGLE_SECRET;


// ==================================================
//       Autenticacion de google 
// ==================================================

app.post('/google', (req, res) => {

    const token = req.body.token || 'xxx';
    const client = new auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_SECRET, '');

    client.verifyIdToken(
        token,
        GOOGLE_CLIENT_ID, // Specify the CLIENT_ID of the app that accesses the backend
        // Or, if multiple clients access the backend:
        //[CLIENT_ID_1, CLIENT_ID_2, CLIENT_ID_3],
        function(e, login) {

            if (e) {
                return res.status(400).json({
                    ok: false,
                    mensage: e,
                    mensage: 'Objeto no valido ',
                    token: token
                });
            }


            let payload = login.getPayload();
            let userid = payload['sub'];
            // If request specified a G Suite domain:
            //var domain = payload['hd'];


            Usuario.findOne({ email: payload.email }, (err, usuario) => {

                if (err) {
                    return res.status(500).json({
                        ok: true,
                        mensage: 'Objeto no valido ',
                        errors: err
                    });
                }

                // Si el usuario ya existe en la base de datos.
                if (usuario) {
                    // Usuario no tiene autenticacion con google
                    if (usuario.google === false) {
                        return res.status(400).json({
                            ok: true,
                            mensage: 'Debe utilizar su autenticacion normal ',
                            errors: err
                        });
                        // Usuario tiene autenticacion con google le damos TOKEN
                    } else {
                        // Esconder el password
                        usuario.password = ':)';
                        // Si usuario y contraseña son correctos = TOKEN
                        // Payload es el usuario + el secret key + expiracion en 4 horas
                        const token = jwt.sign({ usuario: usuario }, SEED, { expiresIn: 14400 });

                        res.status(200).json({
                            ok: true,
                            usuario: usuario,
                            token: token,
                            id: usuario._id
                        });

                    }
                    // Si no hay usuario entonces:
                } else {
                    // Generamos un nuevo usuario 
                    // como usuario proveniente de google.
                    const usuario = new Usuario();
                    // llenamos la data con la informacion
                    usuario.nombre = payload.name;
                    usuario.email = payload.email;
                    usuario.password = ':)';
                    usuario.img = payload.picture;
                    usuario.google = true;

                    usuario.save((err, usuarioDB) => {

                        if (err) {
                            return res.status(500).json({
                                ok: true,
                                mensage: 'Error al crear usuario - google ',
                                errors: err
                            });
                        }

                        const token = jwt.sign({ usuario: usuarioDB }, SEED, { expiresIn: 14400 });

                        res.status(200).json({
                            ok: true,
                            usuario: usuarioDB,
                            token: token,
                            id: usuario._id
                        });


                    });
                }

            });

        }
    );

});


// ==================================================
//       Autenticacion normal 
// ==================================================

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