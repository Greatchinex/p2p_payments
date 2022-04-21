import 'reflect-metadata'
import express from 'express'
import { config } from 'dotenv'
import cors from 'cors'
import Logger from './config/logger'

import './config/db'

config()

const app = express()
const port = process.env.PORT
app.use(express.json())
app.use(cors())

app.listen(port, () => {
  Logger.info('Server is listening on port %s', port)
})
