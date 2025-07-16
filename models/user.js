const moongoose = require('mongoose')

const userSchema = new moongoose.Schema({
    username: {
        type: String,
        required: [true, 'Username is required'],
        unique: true,
        minLength: [3, 'Username is too short (minimum length: 3)']
    },
    name: String,
    passwordHash: String,
    blogs: [
        {
            type: moongoose.Schema.Types.ObjectId,
            ref: 'Blog'
        }
    ]
})

userSchema.set('toJSON', {
    transform: (doc, retObj) => {
        retObj.id = retObj._id.toString()
        delete retObj._id
        delete retObj.__v
        delete retObj.passwordHash
    }
})

module.exports = moongoose.model('User', userSchema)