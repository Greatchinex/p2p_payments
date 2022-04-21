import * as Joi from 'joi'

export default async (body: any) => {
  try {
    const signupSchema = Joi.object().keys({
      fname: Joi.string().required(),
      lname: Joi.string().required(),
      email: Joi.string().email().required(),
      phone_number: Joi.string().required().min(11).max(13),
      password: Joi.string().min(7).max(15).required().messages({
        'string.base': "password should be a type of 'text'",
        'string.empty': 'password cannot be empty',
        'string.min': 'password must be minimum of 8 characters',
        'any.required': 'password is required'
      })
    })

    const data = await signupSchema.validateAsync(body)

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
