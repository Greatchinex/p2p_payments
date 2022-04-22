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

  public async login(request: Request, response: Response) {
    try {
      const resp = await this._userService.login(request.body)

      if (!resp.success) {
        return this._requestResponses.handleErrorResponse({
          request,
          response,
          message: resp.message,
          http_code: resp.status!,
          log_body: false,
          data: {}
        })
      }

      return this._requestResponses.handleSuccessResponse({
        request,
        response,
        message: 'Login successful',
        http_code: resp.status!,
        log_body: false,
        data: {
          token: resp.message
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

  public async me(request: Request, response: Response) {
    try {
      const resp = await this._userService.me(request.user!.user_id)

      return this._requestResponses.handleSuccessResponse({
        request,
        response,
        message: 'Profile fetched successfully',
        http_code: StatusCodes.OK,
        log_body: true,
        data: {
          user: resp
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

export const userController = new UserController(userService, requestResponses)
