const logger = require('./logger.js')

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
    }

    next(error)
}

module.exports = { reqLogger, unknownEndpoint, errorHandler }