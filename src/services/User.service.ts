import { startSession } from 'mongoose'
import { StatusCodes } from 'http-status-codes'

import { User, VerificationStatus } from '../models/User'
import { Wallet, WalletType } from '../models/Wallet'

import Logger from '../config/logger'
import { validateAttempts } from '../helpers/validateAttempts'
import signupValidator from '../validators/signupValidator'
import loginValidator from '..//validators/loginValidator'

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

  public async login(payload: any) {
    Logger.info('User Login: Payload ===> %o', payload)
    const validate = await loginValidator(payload)

    if (!validate.success) {
      return {
        message: validate.message,
        sucess: validate.success,
        status: validate.status
      }
    }

    const lowercase = payload.email.toLowerCase()
    try {
      const user = await User.findOne({ email: lowercase, deletedAt: null }).select([
        '+password',
        '+password_retries'
      ])

      if (!user) {
        return {
          message: 'Incorrect login details',
          success: false,
          status: StatusCodes.NOT_FOUND
        }
      }

      if (user.status === VerificationStatus.flagged) {
        return {
          message: user.flagged_for ?? 'Your account has been flagged, Please contact support',
          success: false,
          status: StatusCodes.UNAUTHORIZED
        }
      }

      const validatePassword = await user.verifyPass(payload.password)

      if (!validatePassword) {
        const retries = user.password_retries + 1
        await validateAttempts.validatePasswordAttempt(User, user._id, retries)
        return {
          message: 'Incorrect login details',
          success: false,
          status: StatusCodes.NOT_FOUND
        }
      }

      const flagged_for: any = null

      await User.findByIdAndUpdate(user._id, { password_retries: 0, flagged_for })

      const token = user.authToken()

      return {
        message: token,
        success: true,
        status: StatusCodes.OK
      }
    } catch (error) {
      Logger.error({ err: error }, 'User Login: Failed to login user')

      return {
        message: 'Failed to login user',
        success: false,
        status: StatusCodes.INTERNAL_SERVER_ERROR
      }
    }
  }
}

const userService = new UserService()

export { UserService, userService }
