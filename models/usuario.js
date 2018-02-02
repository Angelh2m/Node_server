// Mongo Schema Database
const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');
const Schema = mongoose.Schema;

// Aceptar solo dos tipos de roles
const rolesValidos = {
    values: ['ADMIN_ROLE', 'USER_ROLE'],
    message: '{VALUE} no es un rol valido'
};


const usuarioSchema = new Schema({
    nombre: { type: String, required: [true, 'El nombre es necesario'] },
    email: { type: String, unique: true, required: [true, 'El nombre es necesario'] },
    password: { type: String, required: [true, 'La contraseña es necesaria'] },
    img: { type: String, required: false },
    role: { type: String, required: true, default: 'USER_ROLE', enum: rolesValidos },
    google: { type: Boolean, required: true, default: false }
});

usuarioSchema.plugin(uniqueValidator, { message: '{PATH} debe de ser unico' });
// properties on Schema:
// unique = true or false
// required = true or false + message

module.exports = mongoose.model('Usuario', usuarioSchema);