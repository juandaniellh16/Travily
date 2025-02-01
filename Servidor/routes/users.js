import { Router } from 'express'
import { UserController } from '../controllers/users.js'

export const createUsersRouter = ({ userModel }) => {
  const usersRouter = Router()

  const userController = new UserController({ userModel })

  usersRouter.get('/', userController.getAll)
  usersRouter.post('/', userController.create)

  usersRouter.get('/:id', userController.getById)
  usersRouter.get('/:username', userController.getByUsername)
  usersRouter.delete('/:id', userController.delete)
  usersRouter.patch('/:id', userController.update)

  return usersRouter
}
