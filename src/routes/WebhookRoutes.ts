import express from 'express'

import { webookController } from '../controllers/WebhookController'

const router = express.Router()

router.post('/paystack', webookController.paystack.bind(webookController))

export { router as webhookRouter }
