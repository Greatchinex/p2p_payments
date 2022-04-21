import {
  prop as Property,
  getModelForClass,
  modelOptions,
  Severity,
  Ref
} from '@typegoose/typegoose'

import { userSchema } from './User'

export enum WalletType {
  user = 'user',
  collection = 'collection'
}

@modelOptions({ options: { allowMixed: Severity.ALLOW } })
export class walletSchema {
  _id: string | object

  @Property({ required: true })
  name: string

  @Property({ required: true, default: false })
  pinned: boolean

  @Property({ default: 0 })
  balance: number

  @Property({ default: 0 })
  previous_balance: number

  @Property({ enum: WalletType })
  wallet_type: WalletType

  @Property({ ref: userSchema })
  user_id: Ref<userSchema>

  @Property({ default: null })
  deletedAt: Date | null

  createdAt: Date

  updatedAt: Date
}

export const Wallet = getModelForClass(walletSchema, {
  schemaOptions: { timestamps: true, collection: 'wallets' }
})
