import mongoose from 'mongoose'
import bluebird from 'bluebird'
import { config } from 'dotenv'

import Logger from './logger'
;(<any>mongoose).Promise = bluebird

config()

mongoose
  .connect(process.env.DB_URL!)
  .catch((error) => Logger.error({ err: error }, 'Error connecting to Database'))

// Message if Successfully Connected to DB
mongoose.connection.on('connected', () => {
  Logger.info('Successfully connected to DB')
})
