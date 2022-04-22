import { StatusCodes } from 'http-status-codes'
import { config } from 'dotenv'

import { Transaction } from '../models/Transaction'

import Logger from '../config/logger'

config()

class TransactionService {
  public async show(transaction_id: string) {
    try {
      const transaction = await Transaction.findById(transaction_id)

      if (!transaction) {
        return {
          message: 'Transaction not found',
          success: false,
          status: StatusCodes.NOT_FOUND
        }
      }

      return {
        message: 'Transaction loaded!!!',
        success: true,
        status: StatusCodes.OK,
        data: transaction
      }
    } catch (error) {
      Logger.error({ err: error }, 'Transaction: Failed fetch single transaction')
      throw error
    }
  }

  public async myTransactions(payload: any, user_id: string) {
    const { type, category, status, start_date, end_date, cursor, limit } = payload
    try {
      let transactions
      const perPage = limit ?? 20
      const uuid = user_id

      if (cursor) {
        transactions = Transaction.where('user_id')
          .equals(uuid)
          .where('createdAt')
          .lt(cursor)
          .where('deletedAt')
          .equals(null)
      } else {
        transactions = Transaction.where('user_id').equals(uuid).where('deletedAt').equals(null)
      }

      if (type) {
        console.log(type)
        transactions = transactions.where('type').equals(type)
      }

      if (status) {
        transactions = transactions.where('status').equals(status)
      }

      if (category) {
        transactions = transactions.where('trx_category').equals(category)
      }

      if (start_date && end_date) {
        transactions = transactions
          .where('createdAt')
          .gte(start_date)
          .where('createdAt')
          .lte(end_date)
      }

      transactions = await transactions.limit(perPage + 1).sort({ createdAt: -1 })

      if (transactions.length === 0) {
        return {
          edges: transactions
        }
      } else {
        const hasNextPage = transactions.length > limit
        const edges = hasNextPage ? transactions.slice(0, -1) : transactions

        return {
          edges,
          pageInfo: {
            hasNextPage,
            endCursor: edges[edges.length - 1].createdAt
          }
        }
      }
    } catch (error) {
      Logger.error({ err: error }, 'Transaction: Failed fetch transactions')
      throw error
    }
  }
}

const transactionService = new TransactionService()

export { TransactionService, transactionService }
