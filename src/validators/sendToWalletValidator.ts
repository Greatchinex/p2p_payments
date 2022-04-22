import Joi from 'joi'

export default async (body: any) => {
  try {
    const sendToWalletSchema = Joi.object().keys({
      amount: Joi.number().required(),
      narration: Joi.string(),
      pin: Joi.string().required(),
      receiver_id: Joi.string().required()
    })

    const data = await sendToWalletSchema.validateAsync(body)

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
