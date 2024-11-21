import { user } from './users/users.js'
import { room } from './room/room.js'
import { event } from './event/event.js'
import { company } from './company/company.js'
export const services = (app) => {
  app.configure(user)

  app.configure(room)

  app.configure(event)

  app.configure(company)

  // All services will be registered here
}
