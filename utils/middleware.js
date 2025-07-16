const logger = require('./logger.js')
const User = require('../models/user.js')
const jwt = require('jsonwebtoken')
require('dotenv').config()

const reqLogger = (req, res, next) => {
    logger.info('Method:', req.method)
    logger.info('Path:', req.path)
    if (req.body) { logger.info('Body:', req.body) }
    logger.info('• • •')
    next()
}

const unknownEndpoint = (req, res) => {
    res.status(404).send({ error: 'unknown endpoint' })
}

const errorHandler = (error, req, res, next) => {
    logger.error(error.message)
    logger.info('◦ ◦ ◦')

    if (error.name === 'CastError') {
        return res.status(400).send({ error: 'Malformatted id' })
    } else if (error.name === 'ValidationError') {
        return res.status(400).json({ error: error.message })
    } else if (
        error.name === 'MongoServerError' &&
        error.message.includes('E11000 duplicate key error')
    ) {
        return res.status(400).send({ error: 'Username must be unique' })
    } else if (error.name ===  'JsonWebTokenError') {
        return res.status(401).json({ error: 'Token invalid' })
    } else if (error.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token expired' })
    }

    next(error)
}

function tokenExtractor(req, res, next) {
    const authorization = req.get('authorization')

    const token = authorization && authorization.startsWith('Bearer ')
    ? authorization.replace('Bearer ', '') : null

    if (token) { req.token = token } 
    next()
}

async function userExtractor(req, res, next) {
    if (req.method === 'POST' || req.method === 'DELETE') {
        const decodedToken = jwt.verify(req.token, process.env.SECRET)
        if (!decodedToken.id) {
            return res.status(401).json({ error: 'Token invalid' })
        }
        const rawUser = await User.findById(decodedToken.id)

        const user = {
            id: rawUser._id.toString(),
            username: rawUser.username,
            name: rawUser.name,
            blogs: rawUser.blogs
        }

        // console.log("Usuario logeado: ", user)
        if (user) { req.user = user } 
    }

    next()
}

module.exports = {
    reqLogger, unknownEndpoint, errorHandler, tokenExtractor, userExtractor
}