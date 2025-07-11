require('dotenv').config()

const MONGODB_URL = process.env.NODE_ENV === 'test'
? process.env.TEST_MONGODB_URL
: process.env.MONGODB_URL

const PORT = process.env.PORT

module.exports = { MONGODB_URL, PORT }