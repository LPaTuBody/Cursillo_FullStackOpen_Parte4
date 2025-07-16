const usersRouter = require('express').Router()
const User = require('../models/user.js')
const wrapper = require('../utils/async_wrapper.js')
const bcrypt = require('bcryptjs')

usersRouter.get('/', wrapper(async (req, res) => {
    const users = await User.find({})
    .populate('blogs', { title: 1, author: 1, url: 1, likes: 1 })
    
    res.json(users)
}))

usersRouter.post('/', wrapper(async (req, res) => {
    const { username, name, password } = req.body

    if (!password) {
        return res.status(400).send({ error: 'Password is required' })
    } else if (password.length < 3) {
        return res.status(400).send({ error: 'Password is too short (minimum length: 3)' })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const user = new User({
        username,
        name,
        passwordHash,
    })

    const savedUser = await user.save()
    res.status(201).json(savedUser)
}))

module.exports = usersRouter