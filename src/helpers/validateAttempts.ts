import { VerificationStatus } from '../models/User'

class ValidateAttempts {
  public async validatePasswordAttempt(user: any, id: string | object, password_retries: number) {
    if (password_retries >= 5) {
      const flaggedReason = 'Account flagged for multiple wrong password entries'
      await user.findByIdAndUpdate(id, {
        status: VerificationStatus.flagged,
        flagged_for: flaggedReason,
        password_retries
      })
    } else {
      await user.findByIdAndUpdate(id, {
        password_retries
      })
    }
  }

  public async validatePinAttempt(user: any, id: string | object, pin_retries: number) {
    if (pin_retries >= 5) {
      const flaggedReason = 'Account flagged for multiple wrong pin entries'
      await user.findByIdAndUpdate(id, {
        status: VerificationStatus.flagged,
        flagged_for: flaggedReason,
        pin_retries
      })
    } else {
      await user.findByIdAndUpdate(id, {
        pin_retries
      })
    }
  }
}

export const validateAttempts = new ValidateAttempts()
