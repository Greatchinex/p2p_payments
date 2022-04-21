import express from 'express'

import { userController } from '../controllers/UserController'

const router = express.Router()

router.post('/signup', userController.signup.bind(userController))
router.post('/login', userController.login.bind(userController))

export { router as userRouter }
