import { Request, Response } from 'express'
import Logger from '../config/logger'

interface SRM {
  request: Request
  response: Response
  message: string
  http_code: number
  log_body: boolean
  data?: any
}

interface ERM {
  request: Request
  response: Response
  message: string
  http_code: number
  log_body: boolean
  data?: any
  error?: any
}

class RequestResponses {
  public handleSuccessResponse = ({
    request,
    response,
    data,
    http_code,
    message,
    log_body
  }: SRM) => {
    const logBody = log_body === true ? request.body : ['Redacted']
    Logger.info({ url: request.originalUrl, body: logBody, data }, `${message}`)
    return response.status(http_code).json({
      status: true,
      message,
      data
    })
  }

  public handleErrorResponse = ({
    request,
    response,
    data,
    http_code,
    message,
    error,
    log_body
  }: ERM) => {
    const logBody = log_body === true ? request.body : ['Redacted']
    Logger.error({ url: request.originalUrl, body: logBody, err: error }, `${message}`)

    return response.status(http_code).json({
      status: false,
      message,
      http_code: http_code,
      data,
      error: error?.message
    })
  }
}

const requestResponses = new RequestResponses()

export { RequestResponses, requestResponses }
