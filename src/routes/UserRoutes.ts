import express from 'express'

import { userController } from '../controllers/UserController'

const router = express.Router()

router.get('/send', userController.signup)
router.post('/login', userController.login)

export { router as userRouter }
