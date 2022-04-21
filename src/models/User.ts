import {
  prop as Property,
  getModelForClass,
  modelOptions,
  Severity,
  pre
} from '@typegoose/typegoose'
import argon2 from 'argon2'
import jwt from 'jsonwebtoken'
import { config } from 'dotenv'

config()

enum VerificationStatus {
  approved = 'approved',
  flagged = 'flagged'
}

@pre<userSchema>('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await this.hashPass(this.password)
  }

  next()
})
@modelOptions({ options: { allowMixed: Severity.ALLOW } })
export class userSchema {
  _id: string | object

  @Property({ required: true })
  fname: string

  @Property({ required: true })
  lname: string

  @Property({ required: true, unique: true })
  email: string

  @Property({ required: true, unique: true, index: true })
  phone_number: string

  @Property({ required: true, select: false })
  password: string

  @Property({ select: false })
  pin?: string

  @Property({ enum: VerificationStatus, default: VerificationStatus.approved })
  status: VerificationStatus

  @Property({ default: 0, select: false })
  password_retries: number

  @Property({ default: 0, select: false })
  pin_retries: number

  @Property()
  flagged_for?: string

  @Property({ default: null })
  deletedAt: Date | null

  createdAt: Date

  updatedAt: Date

  // Model instance methods should go below =========//
  // Hash password
  public async hashPass(password: string) {
    return await argon2.hash(password)
  }

  // Verify password
  public async verifyPass(password: string) {
    const cp = await argon2.verify(this.password, password)
    return cp
  }

  public authToken() {
    return jwt.sign(
      { user_id: this._id, user_type: 'user', env: process.env.NODE_ENV },
      process.env.APP_KEY!,
      {
        expiresIn: '2h'
      }
    )
  }
}

export const User = getModelForClass(userSchema, {
  schemaOptions: { timestamps: true, collection: 'users' }
})
