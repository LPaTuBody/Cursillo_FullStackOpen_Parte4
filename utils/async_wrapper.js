// Alternativa para express-async-error, el cual no funciona con Express 5
module.exports = (fn) => {
    return (req, res, next) => {
        Promise.resolve(fn(req, res, next)).catch(next)
    }
}