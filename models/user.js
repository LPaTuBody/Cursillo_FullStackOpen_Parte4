const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true // el nombre de usuario debe ser único
    },
    name: String,
    passwordHash: String,
    notes: [
        {
            type: mongoose.Schema.Types.ObjectId, // referencia a las notas del usuario
            ref: 'Note'
        }
    ],
})

userSchema.set('toJSON', {
    transform: (doc, retObj) => {
        retObj.id = retObj._id.toString()
        delete retObj._id
        delete retObj.__v
        // el passwordHash no debe mostrarse
        delete retObj.passwordHash
    }
})

module.exports = mongoose.model('User', userSchema)