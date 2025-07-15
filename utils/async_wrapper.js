module.exports = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}

// Este wrapper hace lo que el express-async-errors (supongo) debía de hacer
// Captura errores async y los pasa a next()