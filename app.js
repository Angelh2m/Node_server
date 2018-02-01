// Requerimientos
const express = require('express');
const bodyParser = require('body-parser');
// Inicializar variables
const app = express();


// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
    // parse application/json
app.use(bodyParser.json())

// Mongoose
const mongoose = require('mongoose');

// Import routes
const appRoutes = require('./routes/app');
const usuarioRoutes = require('./routes/usuario');
const loginRoutes = require('./routes/login');



mongoose.connect('mongodb://localhost:27017/hospitalDB',
    (err, res) => {

        if (err) throw err;

        console.log('Base de tados: \x1b[32m%s\x1b[0m', 'Online');
    });


// Routes
app.use('/usuario', usuarioRoutes);
app.use('/login', loginRoutes);
app.use('/', appRoutes);


// Escuchar peticiones
app.listen(3000, (req, err) => {
    console.log('Express server puerto 3000: \x1b[32m%s\x1b[0m', 'Online');

});