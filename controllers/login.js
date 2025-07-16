const loginRouter = require('express').Router()
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const User = require('../models/user')
const wrapper = require('../utils/async_wrapper.js')
require('dotenv').config()

loginRouter.post('/', wrapper(async (req, res) => {
    const { username, password } = req.body
    const user = await User.findOne({ username })

    const pwdCorrect = user === null
    ? false
    : await bcrypt.compare(password, user.passwordHash)

    if (!(user && pwdCorrect)) {
        return res.status(401).json({ error: 'Invalid username or password' })
    }

    const token = jwt.sign(
        {
            username: user.username,
            id: user._id,
        },
        process.env.SECRET,
        { expiresIn: 60*60*2 }
    )

    res
    .status(200)
    .send({ token, username: user.username, name: user.name })
}))

module.exports = loginRouter