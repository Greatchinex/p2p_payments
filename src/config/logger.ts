import Logger from 'pino'

const logger = Logger({
  redact: ['password', 'pin'],
  transport: {
    target: 'pino-pretty'
  }
})

export default logger
