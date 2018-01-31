// Requires
let express = require('express');

// Inicializar variables
let app = express();
// Mongoose
const mongoose = require('mongoose');



mongoose.connect('mongodb://localhost:27017/hospitalDB',
    (err, res) => {

        if (err) throw err;

        console.log('Base de tados: \x1b[32m%s\x1b[0m', 'Online');
    });

// Rutas

app.get('/', (req, res, next) => {
    res.status(200).json({
        ok: true,
        mensaje: 'Peticion realizada correctamente'
    });
});



// Escuchar peticiones
app.listen(3000, (req, err) => {
    console.log('Express server puerto 3000: \x1b[32m%s\x1b[0m', 'Online');

});