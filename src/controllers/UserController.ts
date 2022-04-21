import { Request, Response } from 'express'

class UserController {
  public signup(_: Request, res: Response) {
    res.json({ success: true, message: 'Hello There' })
  }

  public login(_: Request, res: Response) {
    res.json({ success: true, message: 'Hello from login' })
  }
}

export const userController = new UserController()
