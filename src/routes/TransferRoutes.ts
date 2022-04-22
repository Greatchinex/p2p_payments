import express from 'express'

import { transferController } from '../controllers/TransferController'
import { auth } from '../middleware/auth'
import { auditBalance } from '../middleware/auditBalance'

const router = express.Router()

router.post('/fund-wallet', auth, transferController.fundWallet.bind(transferController))
router.post(
  '/send-to-wallet',
  auth,
  auditBalance,
  transferController.sendToWallet.bind(transferController)
)

export { router as transferRouter }
