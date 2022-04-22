import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'

import { TransactionService, transactionService } from '../services/transaction.service'
import { RequestResponses, requestResponses } from '../helpers/responses'

class TransactionController {
  constructor(
    private readonly _transactionService: TransactionService,
    private readonly _requestResponses: RequestResponses
  ) {}

  public async myBalance(request: Request, response: Response) {
    try {
      return this._requestResponses.handleSuccessResponse({
        request,
        response,
        message: 'Balance loaded!!!',
        http_code: StatusCodes.OK,
        log_body: true,
        data: {
          wallet: request.balance
        }
      })
    } catch (error) {
      return this._requestResponses.handleErrorResponse({
        request,
        response,
        message: error.message,
        http_code: StatusCodes.INTERNAL_SERVER_ERROR,
        log_body: true,
        error
      })
    }
  }

  public async show(request: Request, response: Response) {
    try {
      if (!request.params.id) {
        return this._requestResponses.handleErrorResponse({
          request,
          response,
          message: 'Please pass a transaction id',
          http_code: StatusCodes.BAD_REQUEST,
          log_body: true
        })
      }

      const resp = await this._transactionService.show(request.params.id)

      if (!resp.success) {
        return this._requestResponses.handleErrorResponse({
          request,
          response,
          message: resp.message,
          http_code: resp.status!,
          log_body: true
        })
      }

      return this._requestResponses.handleSuccessResponse({
        request,
        response,
        message: resp.message,
        http_code: StatusCodes.OK,
        log_body: true,
        data: {
          transaction: resp.data
        }
      })
    } catch (error) {
      return this._requestResponses.handleErrorResponse({
        request,
        response,
        message: error.message,
        http_code: StatusCodes.INTERNAL_SERVER_ERROR,
        log_body: true,
        error
      })
    }
  }

  public async myTransactions(request: Request, response: Response) {
    try {
      const resp = await this._transactionService.myTransactions(
        request.query,
        request.user!.user_id
      )

      return this._requestResponses.handleSuccessResponse({
        request,
        response,
        message: 'Fetched transactions',
        http_code: StatusCodes.OK,
        log_body: true,
        data: {
          transactions: resp
        }
      })
    } catch (error) {
      return this._requestResponses.handleErrorResponse({
        request,
        response,
        message: error.message,
        http_code: StatusCodes.INTERNAL_SERVER_ERROR,
        log_body: true,
        error
      })
    }
  }
}

export const transactionController = new TransactionController(transactionService, requestResponses)
