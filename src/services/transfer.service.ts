import { startSession } from 'mongoose'
import { Semaphore } from 'async-mutex'
import { StatusCodes } from 'http-status-codes'
import { v4 as uuidv4 } from 'uuid'

import { User } from '../models/User'
import { Wallet } from '../models/Wallet'
import { TransactionType, TransactionCategory } from '../models/Transaction'

import Logger from '../config/logger'
import { paystackHelper } from '../helpers/paystack'
import { walletService } from './wallet.service'
import { saveTransactionType } from '../types/newTransaction'
import { p2pMeta } from '../types/transactionMeta'
import sendToWalletValidator from '../validators/sendToWalletValidator'

const maxConcurrentRequests = 1
const semaphore = new Semaphore(maxConcurrentRequests)

class TransferService {
  public async fundWallet(user_id: string | object, amount: number) {
    try {
      const user = await User.findById(user_id)

      if (!user) {
        return {
          message: 'User not found',
          success: false,
          status: StatusCodes.NOT_FOUND
        }
      }

      const body = {
        amount,
        email: user.email,
        currency: 'NGN',
        reference: `ref_${uuidv4()}-${Date.now()}`,
        callback_url: 'https://www.summitech.ng/',
        channels: ['card'],
        metadata: {
          user_id: user._id,
          transaction_type: 'funding'
        }
      }

      const fundingResp = await paystackHelper.initiateFunding(body)

      if (!fundingResp.status) {
        return {
          message: fundingResp.message,
          success: false,
          status: StatusCodes.BAD_REQUEST
        }
      }

      return {
        message: 'Payment link initiated',
        success: true,
        status: StatusCodes.OK,
        data: fundingResp.data
      }
    } catch (error) {
      Logger.error({ err: error }, 'Fund Wallet: Could not initiate funding')
      return {
        message: 'Could not initiate funding',
        success: false,
        status: StatusCodes.INTERNAL_SERVER_ERROR
      }
    }
  }

  public async sendToWallet(payload: any, wallet: any, sender_id: string) {
    Logger.info('P2P: Send Funds To another Wallet: Payload ===> %o', payload)
    const validate = await sendToWalletValidator(payload)

    if (!validate.success) {
      return {
        message: validate.message,
        success: validate.success,
        status: validate.status
      }
    }
    try {
      if (payload.amount > wallet.balance) {
        return {
          message: 'Insufficient funds',
          success: false,
          status: StatusCodes.BAD_REQUEST
        }
      }

      const reference = `p2p_${uuidv4()}-${Date.now()}`
      const destinationReference = `p2p_${uuidv4()}-${Date.now()}`

      semaphore.runExclusive(async () => {
        const session = await startSession()
        session.withTransaction(async () => {
          // Debit sender
          await Wallet.findOneAndUpdate(
            { user_id: sender_id },
            { $inc: { balance: -payload.amount } },
            { new: true }
          ).session(session)

          // Credit Receiver
          const receiverWallet: any = await Wallet.findOneAndUpdate(
            { user_id: payload.receiver_id },
            { $inc: { balance: +payload.amount } },
            { new: true }
          ).session(session)

          const meta: p2pMeta = {
            charges: 0,
            sender_wallet: wallet.name,
            receiver_wallet: receiverWallet?.name
          }

          Logger.info(
            'P2P: Debited sender and credit receiver, sender wallet ===> %o, receiver wallet ===> %o',
            wallet._id,
            receiverWallet?._id
          )

          const receiverWalletName = receiverWallet?.name ?? 'User'
          const sourceNarration = payload.narration ?? `Transfer Funds to ${receiverWalletName}`
          const destinationNarration = payload.narration ?? `Received funds from ${wallet.name}`

          const sourceTransaction: saveTransactionType = {
            reference: reference,
            type: TransactionType.debit,
            description: sourceNarration,
            provider: 'summitech',
            meta: JSON.stringify(meta),
            amount: payload.amount,
            trx_category: TransactionCategory.p2p,
            user_id: sender_id,
            wallet_id: wallet._id,
            peer_user_id: payload.receiver_id,
            peer_wallet_id: String(receiverWallet?._id)
          }

          const destinationTransaction: saveTransactionType = {
            reference: destinationReference,
            type: TransactionType.credit,
            description: destinationNarration,
            provider: 'summitech',
            meta: JSON.stringify(meta),
            amount: payload.amount,
            trx_category: TransactionCategory.p2p,
            user_id: payload.receiver_id,
            wallet_id: receiverWallet?._id,
            peer_user_id: sender_id,
            peer_wallet_id: String(wallet._id)
          }

          // Insert debit transaction
          await walletService.insertTransaction(sourceTransaction, session)
          // Insert credit transaction
          await walletService.insertTransaction(destinationTransaction, session)

          // Note: If there are charges then debit sender again and credit collection account
          Logger.info(
            'P2P: Transactions saved successfully, source reference ===> %o, destination reference ===> %o',
            reference,
            destinationReference
          )
        })
      })

      return {
        message: 'Transaction processing',
        success: true,
        status: StatusCodes.CREATED
      }
    } catch (error) {
      return {
        message: 'Could not complete transfer',
        success: false,
        status: StatusCodes.INTERNAL_SERVER_ERROR
      }
    }
  }
}

const transferService = new TransferService()

export { TransferService, transferService }
