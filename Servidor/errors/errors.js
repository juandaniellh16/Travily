export class DatabaseError extends Error {
  constructor (message) {
    super(message)
    this.name = 'DatabaseError'
  }
}

export class InvalidInputError extends Error {
  constructor (message) {
    super(message)
    this.name = 'InvalidInputError'
  }
}

export class NotFoundError extends Error {
  constructor (message) {
    super(message)
    this.name = 'NotFoundError'
  }
}

export class UnauthorizedError extends Error {
  constructor (message) {
    super(message)
    this.name = 'UnauthorizedError'
  }
}

export class ConflictError extends Error {
  constructor (message) {
    super(message)
    this.name = 'ConflictError'
  }
}
