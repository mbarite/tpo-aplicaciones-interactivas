function notFoundHandler(_req, res) {
  return res.status(404).json({
    message: "Ruta no encontrada."
  });
}

function errorHandler(error, _req, res, _next) {
  if (error.code === 11000) {
    return res.status(409).json({
      message: "Ya existe un registro con ese valor unico."
    });
  }

  if (error.name === "ValidationError") {
    return res.status(400).json({
      message: error.message
    });
  }

  const statusCode = error.statusCode || 500;

  return res.status(statusCode).json({
    message: error.message || "Ocurrio un error interno."
  });
}

module.exports = {
  notFoundHandler,
  errorHandler
};
