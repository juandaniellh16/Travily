const ERROR_HANDLERS = {
  JsonWebTokenError: (res, error) => res.status(401).json({ error: error.name, message: 'token missing or invalid' }),
  TokenExpiredError: (res, error) => res.status(401).json({ error: error.name, message: 'token expired' }),
  DatabaseError: (res, error) => res.status(500).json({ error: error.name, message: 'database error' }),
  NotFoundError: (res, error) => res.status(404).json({ error: error.name, message: error.message }),
  InvalidInputError: (res, error) => res.status(400).json({ error: error.name, message: error.message }),
  UnauthorizedError: (res, error) => res.status(401).json({ error: error.name, message: error.message }),
  UsernameConflictError: (res, error) => res.status(409).json({ error: error.name, message: error.message }),
  EmailConflictError: (res, error) => res.status(409).json({ error: error.name, message: error.message }),
  defaultError: (res, error) => res.status(500).json({ error: 'internal server error' })
}

export const errorHandler = (error, req, res, next) => {
  console.error(`${error.name}: ${error.message}`)

  const handler = ERROR_HANDLERS[error.name] || ERROR_HANDLERS.defaultError

  handler(res, error)
}
