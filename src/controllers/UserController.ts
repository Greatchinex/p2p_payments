import { Request, Response } from 'express'
import { StatusCodes } from 'http-status-codes'

import { UserService, userService } from '../services/user.service'
import { RequestResponses, requestResponses } from '../helpers/responses'

class UserController {
  constructor(
    private readonly _userService: UserService,
    private readonly _requestResponses: RequestResponses
  ) {}

  public async signup(request: Request, response: Response) {
    try {
      const { success, status, message } = await this._userService.signup(request.body)

      if (!success) {
        return this._requestResponses.handleErrorResponse({
          request,
          response,
          message,
          http_code: status!,
          log_body: false,
          data: {}
        })
      }

      return this._requestResponses.handleSuccessResponse({
        request,
        response,
        message: 'User created successfully',
        http_code: status!,
        log_body: false,
        data: {
          token: message
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

  public login(_: Request, res: Response) {
    res.json({ success: true, message: 'Hello from login' })
  }
}

export const userController = new UserController(userService, requestResponses)
