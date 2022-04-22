import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'

import { TransferService, transferService } from '../services/transfer.service'
import { RequestResponses, requestResponses } from '../helpers/responses'

class TransferController {
  constructor(
    private readonly _transferService: TransferService,
    private readonly _requestResponses: RequestResponses
  ) {}

  public async fundWallet(request: Request, response: Response) {
    try {
      if (!request.body.amount) {
        return this._requestResponses.handleErrorResponse({
          request,
          response,
          message: 'Please pass an amount to fund wallet',
          http_code: StatusCodes.BAD_REQUEST,
          log_body: true
        })
      }

      const resp = await this._transferService.fundWallet(
        request.user!.user_id,
        request.body.amount
      )

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
        http_code: resp.status!,
        log_body: true,
        data: {
          payments: resp.data
        }
      })
    } catch (error) {
      return this._requestResponses.handleErrorResponse({
        request,
        response,
        message: error.message,
        http_code: StatusCodes.INTERNAL_SERVER_ERROR,
        log_body: false,
        error
      })
    }
  }
}

export const transferController = new TransferController(transferService, requestResponses)
