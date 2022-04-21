import * as Joi from 'joi'

export default async (body: any) => {
  try {
    const loginSchema = Joi.object().keys({
      email: Joi.string().email().required(),
      password: Joi.string().min(7).max(15).required().messages({
        'string.base': "password should be a type of 'text'",
        'string.empty': 'password cannot be empty',
        'string.min': 'password must be minimum of 7 characters',
        'any.required': 'password is required'
      })
    })

    const data = await loginSchema.validateAsync(body)

    if (data.error) {
      return {
        success: false,
        message: data.error.details[0].message,
        status: 400,
        data: data.error
      }
    }
    return {
      success: true,
      data
    }
  } catch (error) {
    const errors = error.message.split('.')
    return {
      success: false,
      message: errors[0],
      status: 400,
      data: errors
    }
  }
}
