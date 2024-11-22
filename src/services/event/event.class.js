import { MongoDBService } from '@feathersjs/mongodb'
import { ObjectId } from 'mongodb'

// By default calls the standard MongoDB adapter service methods but can be customized with your own functionality.
export class EventService extends MongoDBService {
  async create(data, params) {
    if (data.organizer) {
      data.organizer = new ObjectId(data.organizer)
    }

    return super.create(data, params)
  }
}

export const getOptions = (app) => {
  return {
    paginate: app.get('paginate'),
    Model: app.get('mongodbClient').then((db) => db.collection('event'))
  }
}
