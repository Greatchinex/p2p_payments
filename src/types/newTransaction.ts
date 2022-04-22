export type saveTransactionType = {
  reference: string
  type: string
  description: string
  provider: string
  meta: string
  provider_reference: string
  provider_fees: number
  amount: number
  trx_category: string
  user_id: string | object
  wallet_id: string | object
  peer_user_id: string
  peer_wallet_id: string
}
