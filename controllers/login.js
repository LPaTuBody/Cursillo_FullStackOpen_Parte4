const jwt = require('jsonwebtoken') // Importing jwt for token generation
const bcrypt = require('bcrypt') // Importing bcrypt for password hashing
const loginRouter = require('express').Router()
const User = require('../models/user')
const asyncWrapper = require('../utils/async_wrapper')
require('dotenv').config()

loginRouter.post('/', asyncWrapper(async (req, res) => {
    const { username, password } = req.body
    const user = await User.findOne({ username })

    const passwordCorrect = user === null
    ? false
    : await bcrypt.compare(password, user.passwordHash)

    if (!(user && passwordCorrect)) {
        return res.status(401).json({ error: 'invalid username or password' })
    }

    const userForToken = {
        username: user.username,
        id: user._id,
    }

    const token = jwt.sign(
        userForToken,
        process.env.SECRET,
        { expiresIn: 60*60 } // Token expires in 1 hour
    )

    res.status(200).send({
        token,
        username: user.username,
        name: user.name
    })
}))

module.exports = loginRouter