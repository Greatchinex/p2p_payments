import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { StatusCodes } from 'http-status-codes'
import { config } from 'dotenv'

import { requestResponses } from '../helpers/responses'

config()

export const auth = (request: Request, response: Response, next: NextFunction) => {
  try {
    const headers = request.headers.authorization

    if (!headers) {
      throw new Error()
    }

    const headerValue = headers.split(' ')
    const token = headerValue[1]

    const decodedToken: any = jwt.verify(token, process.env.APP_KEY!)

    // TODO??????? Check redis for user details.
    request.user = decodedToken

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
