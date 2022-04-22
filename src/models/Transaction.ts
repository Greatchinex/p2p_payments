import {
  prop as Property,
  getModelForClass,
  modelOptions,
  Severity,
  Ref
} from '@typegoose/typegoose'

import { userSchema } from './User'
import { walletSchema } from './Wallet'

export enum TransactionType {
  debit = 'debit',
  credit = 'credit'
}

export enum TransactionStatus {
  successful = 'successful',
  failed = 'failed'
}

export enum TransactionCategory {
  funding = 'funding',
  withdrawal = 'withdrawal',
  p2p = 'p2p',
  charges = 'charges'
}
@modelOptions({ options: { allowMixed: Severity.ALLOW } })
export class transactionSchema {
  _id: string | object

  @Property({ required: true })
  reference: string

  @Property({ required: true, enum: TransactionType })
  type: TransactionType

  @Property({ required: true })
  description: string

  @Property({ required: true })
  provider: string

  @Property({ required: true })
  meta: string

  @Property()
  provider_reference?: string

  @Property({ default: 0 })
  provider_fees: number

  @Property({ default: false })
  outward: boolean

  @Property({ enum: TransactionStatus, default: TransactionStatus.successful })
  status: TransactionStatus

  @Property({ required: true, default: 0 })
  amount: number

  @Property({ enum: TransactionCategory })
  trx_category: TransactionCategory

  @Property({ ref: userSchema })
  user_id: Ref<userSchema>

  @Property({ ref: walletSchema })
  wallet_id: Ref<walletSchema>

  @Property()
  peer_user_id: string

  @Property()
  peer_wallet_id: string

  @Property({ default: null })
  deletedAt: Date | null

  createdAt: Date

  updatedAt: Date
}

export const Transaction = getModelForClass(transactionSchema, {
  schemaOptions: { timestamps: true, collection: 'transactions' }
})
