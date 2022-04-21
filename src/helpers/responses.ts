import { Request, Response } from 'express'
import Logger from '../config/logger'

interface SRM {
  request: Request
  response: Response
  message: string
  http_code: number
  data?: any
}

interface ERM {
  request: Request
  response: Response
  message: string
  http_code: number
  data?: any
  error?: any
}

class RequestResponses {
  public handleSuccessResponse = ({ request, response, data, http_code, message }: SRM) => {
    Logger.info({ url: request.originalUrl, body: request.body(), data }, `${message}`)
    return response.status(http_code).json({
      status: true,
      message,
      data
    })
  }

  public handleErrorResponse = ({ request, response, data, http_code, message, error }: ERM) => {
    Logger.error({ url: request.originalUrl, body: request.body(), err: error }, `${message}`)

    return response.status(http_code).json({
      status: false,
      message,
      http_code: http_code,
      data,
      error: error.message
    })
  }
}

const requestResponses = new RequestResponses()

export { RequestResponses, requestResponses }
