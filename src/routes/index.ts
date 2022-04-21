import { userRouter } from './UserRoutes'

import { routePrefix } from '../config/routePrefix'

export default (app: any) => {
  app.use(`${routePrefix.coreRouteV1}/user`, userRouter)
}
