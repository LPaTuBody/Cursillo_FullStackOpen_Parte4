const express = require('express')
const cors = require('cors')
const mongoose = require('mongoose')
const config = require('./utils/config.js')
const logger = require('./utils/logger.js')
const middleware = require('./utils/middleware.js')
const blogsRouter = require('./controllers/blogs.js')
const app = express()

// Database connection
mongoose.set('strictQuery', false)
mongoose.connect(config.MONGODB_URL)
.then(() => {
    logger.info('Connected to MongoDB in:', config.MONGODB_URL)
})
.catch((error) => {
    logger.error('Error connecting to MongoDB:', error.message)
})

// Middleware setup
app.use(express.static('dist'))
app.use(express.json())
app.use(cors())
app.use(middleware.reqLogger)

app.use('/api/blogs', blogsRouter)

app.use(middleware.unknownEndpoint)
app.use(middleware.errorHandler)

module.exports = app