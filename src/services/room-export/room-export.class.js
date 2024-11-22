import { MongoDBService } from '@feathersjs/mongodb'

// By default calls the standard MongoDB adapter service methods but can be customized with your own functionality.
export class RoomExportService extends MongoDBService {
  setup(app) {
    this.app = app
  }
  async find(params) {
    const { app } = this
    const roomService = app.service('room')
    const eventService = app.service('event')
    const userService = app.service('users')
    const companyService = app.service('company')

    const rooms = await roomService.find(params)

    const roomData = await Promise.all(
      rooms.data.map(async (room) => {
        const events = await eventService.find({
          query: { location: room._id }
        })

        const enrichedEvents = await Promise.all(
          events.data.map(async (event) => {
            const organizer = await userService.get(event.organizer)
            const company = await companyService.get(organizer.company)

            return {
              subject: event.subject,
              start: event.start,
              end: event.end,
              organizerName: organizer?.name || 'Unknown Organizer',
              organizerCompany: company?.name || 'Unknown Company',
              locationName: room.name,
              totalTime: (event.end - event.start) / 60 // Prepočet na minúty
            }
          })
        )

        return {
          name: room.name,
          number: room.number,
          capacity: room.capacity,
          events: enrichedEvents
        }
      })
    )

    return { roomData }
  }
}

export const getOptions = (app) => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('mongodbClient').then((db) => db.collection('room-export'))
  }
}
