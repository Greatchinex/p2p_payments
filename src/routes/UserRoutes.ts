import express from 'express'

import { userController } from '../controllers/UserController'
import { auth } from '../middleware/auth'

const router = express.Router()

router.post('/signup', userController.signup.bind(userController))
router.post('/login', userController.login.bind(userController))
router.get('/', auth, userController.me.bind(userController))

export { router as userRouter }
