const Note = require('../models/note')
const User = require('../models/user')
const jwt = require('jsonwebtoken')
require('dotenv').config()

const initialNotes = [
  {
    content: 'HTML is easy',
    important: false
  },
  {
    content: 'Browser can execute only JavaScript',
    important: true
  }
]

const nonExistingId = async () => {
  const note = new Note({ content: 'willremovethissoon' })
  await note.save()
  await note.deleteOne()

  return note._id.toString()
}

const notesInDb = async () => {
  const notes = await Note.find({})
  return notes.map(note => note.toJSON())
}

const usersInDb = async () => {
  const users = await User.find({})
  return users.map(u => u.toJSON())
}

const tokenUserLoged = async () => {
  const user = await User.findOne({ username: 'root' })
  const token = jwt.sign(
    {
      username: user.username,
      id: user._id,
    },
    process.env.SECRET
  )
  return token
}

module.exports = {
  initialNotes, nonExistingId, notesInDb, usersInDb, tokenUserLoged
}