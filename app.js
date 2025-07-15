const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose')
const config = require('./utils/config')
const logger = require('./utils/logger')
const middleware = require('./utils/middleware')

// Importing routers
const loginRouter = require('./controllers/login')
const notesRouter = require('./controllers/notes')
const usersRouter = require('./controllers/users')

// Database connection
mongoose.set('strictQuery', false)
logger.info('Connecting to', config.MONGODB_URI)

mongoose.connect(config.MONGODB_URI)
.then(() => {
    logger.info('Connected to MongoDB')
})
.catch((error) => {
    logger.error('Error connecting to MongoDB:', error.message)
})

// Middleware setup
app.use(express.static('dist'))
app.use(express.json())
app.use(cors())
app.use(middleware.reqLogger)

app.use('/api/login', loginRouter)
app.use('/api/notes', notesRouter)
app.use('/api/users', usersRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app