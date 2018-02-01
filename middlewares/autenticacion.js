// Json web token
const jwt = require('jsonwebtoken');
const SEED = require('../config/config').SEED;


// ==================================================
//       Verificar Token = Middleware 
// ==================================================

// Forma de exportar el middleware
exports.verificaToken = (req, res, next) => {
    // Agarrar el token del "request query" en el url
    const token = req.query.token;

    jwt.verify(token, SEED, (err, decoded) => {

        if (err) {
            return res.status(401).json({
                ok: false,
                mensaje: 'Token incorrecto',
                error: err
            });
        }

        // leer la informacion del token 
        req.usuario = decoded.usuario;

        // Pasar al siguiente paso que es verificar la informacion 
        next();
        // return res.status(200).json({
        //     ok: false,
        //     decoded: decoded
        // });

    });

}