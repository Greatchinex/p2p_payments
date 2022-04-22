import { TransactionType, TransactionCategory, TransactionStatus } from '../models/Transaction'

export type saveTransactionType = {
  reference: string
  type: TransactionType
  description: string
  provider: string
  meta: string
  provider_reference?: string
  provider_fees?: number
  status?: TransactionStatus
  amount: number
  trx_category: TransactionCategory
  user_id: string | object
  wallet_id: string | object
  peer_user_id: string
  peer_wallet_id: string
}
