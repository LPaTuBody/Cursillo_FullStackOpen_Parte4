const notesRouter = require('express').Router()
const Note = require('../models/note')
const User = require('../models/user')
// Reemplazo de express-async-errors porque no funciona con Express 5
const asyncWrapper = require('../utils/async_wrapper')
const jwt = require('jsonwebtoken')

const getTokenFrom = (request) => {
  const authorization = request.get('authorization')
  if (authorization && authorization.startsWith('Bearer ')) {
    return authorization.replace('Bearer ', '')
  }
  return null
}

notesRouter.get('/', asyncWrapper(async (req, res) => {
  const notes = await Note.find({}).populate('user', { username: 1, name: 1 })
  res.json(notes)
}))

notesRouter.get('/:id', asyncWrapper(async (req, res) => {
  const note = await Note.findById(req.params.id)
  note ? res.json(note) : res.status(404).end()
}))

notesRouter.post('/', asyncWrapper(async (req, res) => {
  const body = req.body
  const decodedToken = jwt.verify(getTokenFrom(req), process.env.SECRET)
  if (!decodedToken.id) {
    return response.status(401).json({ error: 'token invalid' })
  }
  const user = await User.findById(decodedToken.id)

  const note = new Note({
    content: body.content,
    important: body.important || false,
    user: user.id
  })

  const savedNote = await note.save()
  user.notes = user.notes.concat(savedNote._id)
  await user.save()
  res.status(201).json(savedNote)
}))

notesRouter.delete('/:id', asyncWrapper(async (req, res) => {
  await Note.findByIdAndDelete(req.params.id)
  res.status(204).end()
}))

notesRouter.put('/:id', asyncWrapper(async (req, res) => {
  const { content, important, user } = req.body
  const updatedNote = await Note.findByIdAndUpdate(
    req.params.id,
    { content, important, user },
    { new: true, runValidators: true, context: 'query' }
  )
  res.json(updatedNote)
}))

module.exports = notesRouter