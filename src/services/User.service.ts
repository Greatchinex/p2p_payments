import { startSession } from 'mongoose'
import { StatusCodes } from 'http-status-codes'

import { User } from '../models/User'
import { Wallet, WalletType } from '../models/Wallet'

import Logger from '../config/logger'
import signupValidator from '../validators/signupValidator'

class UserService {
  public async signup(payload: any) {
    Logger.info('User Signup: Payload ===> %o', payload)
    const validate = await signupValidator(payload)

    if (!validate.success) {
      return {
        message: validate.message,
        sucess: validate.success,
        status: validate.status
      }
    }
    let session
    const lowercase = payload.email.toLowerCase()
    try {
      const findUser = await User.findOne({
        $or: [
          { email: lowercase, deletedAt: null },
          { phone_number: payload.phone_number, deletedAt: null }
        ]
      })

      if (findUser) {
        return {
          message: 'User with the email or phone number you entered already exist',
          sucess: false,
          status: StatusCodes.BAD_REQUEST
        }
      }

      session = await startSession()
      session.startTransaction()

      const newUser = new User({ ...payload, email: lowercase })
      const savedUser = await User.create([newUser], { session })
      // create user wallet
      const newWallet = new Wallet({
        name: `${savedUser[0].fname} ${savedUser[0].lname}`,
        pinned: true,
        wallet_type: WalletType.user,
        user_id: savedUser[0]._id
      })

      await Wallet.create([newWallet], { session })

      await session.commitTransaction()

      Logger.info(
        'User Signup: User created successfully, ===> %o',
        JSON.stringify({ id: savedUser[0]._id })
      )

      const token = savedUser[0].authToken()

      // TODO??????? Create Virtual Accounts as another means of funding???.
      // @NOTE: Email service will also be called to send welcome mail

      return {
        message: token,
        success: true,
        status: StatusCodes.CREATED
      }
    } catch (error) {
      Logger.error({ err: error }, 'User Signup: Could not create new user')
      if (session) {
        await session.abortTransaction()
      }

      return {
        message: 'Could not register user',
        success: false,
        status: StatusCodes.INTERNAL_SERVER_ERROR
      }
    } finally {
      if (session) {
        session.endSession()
      }
    }
  }
}

const userService = new UserService()

export { UserService, userService }
