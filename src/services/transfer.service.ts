import { StatusCodes } from 'http-status-codes'
import { v4 as uuidv4 } from 'uuid'

import { User } from '../models/User'

import Logger from '../config/logger'
import { paystackHelper } from '../helpers/paystack'

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
}

const transferService = new TransferService()

export { TransferService, transferService }
