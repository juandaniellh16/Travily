const ERROR_HANDLERS = {
  JsonWebTokenError: res => res.status(401).json({ error: 'token missing or invalid' }),
  TokenExpiredError: res => res.status(401).json({ error: 'token expired' }),
  DatabaseError: res => res.status(500).json({ error: 'database error' }),
  NotFoundError: (res, error) => res.status(404).json({ error: 'resource not found', message: error.message }),
  InvalidInputError: (res, error) => res.status(400).json({ error: 'invalid input', message: error.message }),
  UnauthorizedError: (res, error) => res.status(401).json({ error: 'access not authorized', message: error.message }),
  ConflictError: (res, error) => res.status(409).json({ error: 'resource already exists', message: error.message }),
  defaultError: res => res.status(500).json({ error: 'internal server error' })
}

export const errorHandler = (error, req, res, next) => {
  console.error(`${error.name}: ${error.message}`)

  const handler = ERROR_HANDLERS[error.name] || ERROR_HANDLERS.defaultError

  handler(res, error)
}
