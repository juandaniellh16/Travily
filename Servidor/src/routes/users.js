import { Router } from 'express'
import { UserController } from '../controllers/users.js'

export const createUsersRouter = ({ userModel }) => {
  const usersRouter = Router()

  const userController = new UserController({ userModel })

  usersRouter.get('/', userController.getAll)
  usersRouter.get('/suggested', userController.getSuggestedUsers)
  // usersRouter.post('/', userController.create)

  usersRouter.get('/:identifier', userController.getByIdOrUsername)
  usersRouter.delete('/:id', userController.delete)
  usersRouter.patch('/:id', userController.update)

  usersRouter.post('/:id/follow', userController.follow)
  usersRouter.delete('/:id/follow', userController.unfollow)
  usersRouter.get('/:id/is-following', userController.checkIfFollowing)
  usersRouter.get('/:id/followers', userController.getFollowers)
  usersRouter.get('/:id/following', userController.getFollowing)

  return usersRouter
}
