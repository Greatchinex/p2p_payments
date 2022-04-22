import 'reflect-metadata'
import express from 'express'
import { config } from 'dotenv'
import cors from 'cors'

import Logger from './config/logger'
import './config/db'
import routes from './routes'

config()

const app = express()
const port = process.env.PORT
app.use(express.json())
app.use(cors())

routes(app)

app.get('/', (_, response) => {
  const welcome = {
    status: true,
    message: 'Welcome to Payments',
    data: {
      api: 'Core Service'
    }
  }

  response.status(200).json(welcome)
})

app.listen(port, () => {
  Logger.info('Server is listening on port %s', port)
})
