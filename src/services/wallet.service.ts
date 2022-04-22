import { startSession } from 'mongoose'
import { Semaphore } from 'async-mutex'
import { config } from 'dotenv'

import { Wallet } from '../models/Wallet'
import { Transaction, TransactionType, TransactionCategory } from '../models/Transaction'
import { saveTransactionType } from '../types/newTransaction'
import { fundingMeta } from '../types/transactionMeta'

import Logger from '../config/logger'
import { paystackHelper } from '../helpers/paystack'

const maxConcurrentRequests = 1
const semaphore = new Semaphore(maxConcurrentRequests)

config()

class WalletService {
  public async insertTransaction(payload: saveTransactionType, session?: any) {
    const transaction = {
      ...payload,
      amount: payload.type === TransactionType.debit ? -payload.amount : payload.amount
    }

    const newTransaction = new Transaction(transaction)

    if (session) {
      await Transaction.create([newTransaction], { session })
    } else {
      try {
        await Transaction.create(newTransaction)
      } catch (error) {
        Logger.error({ err: error }, 'Transaction: Failed to insert into transaction')
      }
    }
  }

  public async handleFunding(payload: any) {
    const data = payload.data
    Logger.info('Fund Wallet: handle funding method called ===> %o', data)
    try {
      // Verify transaction
      const verifiedTransaction = await paystackHelper.verifyTransaction(data.reference)
      Logger.info(
        'Fund Wallet: Paystack verified transaction ===> %o, Reference ===> %o',
        verifiedTransaction,
        data.reference
      )
      const amount = verifiedTransaction.amount
      const user_id = data.metadata?.user_id
      const meta: fundingMeta = {
        charges: 0,
        authorization: data.authorization ?? '',
        customer: data.customer ?? ''
      }

      if (verifiedTransaction.status === 'success') {
        semaphore.runExclusive(async () => {
          Logger.info('Locked and Funding Wallet')
          const session = await startSession()
          session.withTransaction(async () => {
            const fundWallet: any = await Wallet.findOneAndUpdate(
              { user_id },
              { $inc: { balance: +amount } },
              { new: true }
            ).session(session)

            const transactionData: saveTransactionType = {
              reference: data.reference,
              type: TransactionType.credit,
              description: 'Wallet funding',
              provider: 'paystack',
              meta: JSON.stringify(meta),
              provider_reference: data.reference,
              provider_fees: data.fees ?? 0,
              amount,
              trx_category: TransactionCategory.funding,
              user_id,
              wallet_id: fundWallet?._id,
              peer_user_id: process.env.PAYSTACK_MERCHANT_ID!,
              peer_wallet_id: process.env.PAYSTACK_WALLET_ID!
            }

            await this.insertTransaction(transactionData, session)
            Logger.info(
              'Fund Wallet: Saved Trx, WalletId: %o, Transaction Reference: %s',
              fundWallet?._id,
              data.reference
            )
          })
        })
      }
    } catch (error) {
      Logger.error({ err: error }, 'Fund Wallet Error')
      throw error
    }
  }
}

export const walletService = new WalletService()
