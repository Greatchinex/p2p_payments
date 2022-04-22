import { userRouter } from './UserRoutes'
import { transferRouter } from './TransferRoutes'
import { webhookRouter } from './WebhookRoutes'
import { transactionRouter } from './TransactionRoutes'

import { routePrefix } from '../config/routePrefix'

export default (app: any) => {
  app.use(`${routePrefix.coreRouteV1}/user`, userRouter)
  app.use(`${routePrefix.coreRouteV1}/transfer`, transferRouter)
  app.use(`${routePrefix.coreRouteV1}/webhook`, webhookRouter)
  app.use(`${routePrefix.coreRouteV1}/transaction`, transactionRouter)
}
