import express from 'express'

import { transferController } from '../controllers/TransferController'
import { auth } from '../middleware/auth'

const router = express.Router()

router.post('/fund-wallet', auth, transferController.fundWallet.bind(transferController))

export { router as transferRouter }
