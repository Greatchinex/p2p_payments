import { userRouter } from './UserRoutes'
import { transferRouter } from './TransferRoutes'

import { routePrefix } from '../config/routePrefix'

export default (app: any) => {
  app.use(`${routePrefix.coreRouteV1}/user`, userRouter)
  app.use(`${routePrefix.coreRouteV1}/transfer`, transferRouter)
}
