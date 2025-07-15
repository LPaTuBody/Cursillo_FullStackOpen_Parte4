const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const User = require('../models/user')
const asyncWrapper = require('../utils/async_wrapper')

usersRouter.get('/', asyncWrapper(async (req, res) => {
    // Populate muestra las notas asociadas a cada usuario
    const users = await User.find({}).populate('notes', { content: 1, important: 1 })
    res.json(users)
}))

usersRouter.post('/', asyncWrapper(async (req, res) => {
    const { username, name, password } = req.body

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    const user = new User({
        username,
        name,
        passwordHash,
    })

    const savedUser = await user.save()
    res.status(201).json(savedUser)
}))

module.exports = usersRouter