import express from 'express'

import { transactionController } from '../controllers/TransactionController'
import { auth } from '../middleware/auth'
import { auditBalance } from '../middleware/auditBalance'

const router = express.Router()

router.get(
  '/balance',
  auth,
  auditBalance,
  transactionController.myBalance.bind(transactionController)
)
router.get('/:id', auth, transactionController.show.bind(transactionController))
router.get('/', auth, transactionController.myTransactions.bind(transactionController))

export { router as transactionRouter }
