import { Request, Response } from 'express'
import crypto from 'crypto'
import { config } from 'dotenv'

import Logger from '../config/logger'
import { walletService } from '../services/wallet.service'

config()

// NOTE: Normally this will be another microservice different from core service(Probably wallet service)
class WebookController {
  public async paystack(request: Request, response: Response) {
    Logger.info('Paystack Webhook: Payload ===> %o', request.body)
    try {
      const secret = process.env.PAYSTACK_SK!

      const hash = crypto
        .createHmac('sha512', secret)
        .update(JSON.stringify(request.body))
        .digest('hex')

      if (hash !== request.headers['x-paystack-signature']) {
        return response.sendStatus(200)
      }

      const event = request.body

      if (event.event === 'charge.success') {
        await walletService.handleFunding(event)
      }

      return response.sendStatus(200)
    } catch (error) {
      Logger.error({ err: error }, 'Paystack Webhook Error')
      return response.sendStatus(400)
    }
  }
}

export const webookController = new WebookController()
