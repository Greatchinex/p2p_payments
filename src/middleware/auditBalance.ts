import { Request, Response, NextFunction } from 'express'
import { Types } from 'mongoose'
import { StatusCodes } from 'http-status-codes'
import { config } from 'dotenv'

import { Wallet } from '../models/Wallet'
import { Transaction, TransactionType, TransactionStatus } from '../models/Transaction'
import { requestResponses } from '../helpers/responses'

config()

export const auditBalance = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const user = request.user

    if (!user) {
      throw new Error()
    }

    const user_id = new Types.ObjectId(user.user_id)

    const creditQuery = await Transaction.aggregate([
      {
        $match: {
          user_id,
          type: TransactionType.credit,
          status: TransactionStatus.successful
        }
      },
      {
        $group: {
          _id: null,
          amount: { $sum: '$amount' }
        }
      }
    ])

    const debitQuery = await Transaction.aggregate([
      {
        $match: {
          user_id,
          type: TransactionType.debit,
          status: TransactionStatus.successful
        }
      },
      {
        $group: {
          _id: null,
          amount: { $sum: '$amount' }
        }
      }
    ])

    const credit = creditQuery.length > 0 ? creditQuery[0].amount : 0
    const debit = debitQuery.length > 0 ? debitQuery[0].amount : 0 // debit is a negative value

    const balance = credit + debit

    const updatedBalance: any = await Wallet.findOneAndUpdate(
      { user_id: user.user_id },
      { balance },
      { new: true }
    )

    request.balance = updatedBalance

    return next()
  } catch (error) {
    return requestResponses.handleErrorResponse({
      request,
      response,
      message: 'Not authorized, Please login again',
      http_code: StatusCodes.UNAUTHORIZED,
      log_body: true,
      error
    })
  }
}
