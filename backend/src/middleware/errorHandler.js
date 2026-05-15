// Middleware centralizzato per la gestione degli errori
module.exports = function errorHandler(err, req, res, next) {
	console.error(err)
	const status = err.status || 500
	res.status(status).json({
		success: false,
		message: err.message || 'Errore interno del server',
		...(process.env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
	})
}
