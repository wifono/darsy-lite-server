// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'

import { hooks as schemaHooks } from '@feathersjs/schema'
import {
  roomDataValidator,
  roomPatchValidator,
  roomQueryValidator,
  roomResolver,
  roomExternalResolver,
  roomDataResolver,
  roomPatchResolver,
  roomQueryResolver
} from './room.schema.js'
import { RoomService, getOptions } from './room.class.js'
import {
  assignCompaniesToRoom,
  deleteEventsOnRoomRemove,
  unassignCompaniesFromQuery
} from '../../hooks/room.hook.js'

export const roomPath = 'room'
export const roomMethods = ['find', 'get', 'create', 'patch', 'remove']

export * from './room.class.js'
export * from './room.schema.js'

// A configure function that registers the service and its hooks via `app.configure`
export const room = (app) => {
  // Register our service on the Feathers application
  app.use(roomPath, new RoomService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: roomMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(roomPath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(roomExternalResolver),
        schemaHooks.resolveResult(roomResolver)
      ]
    },
    before: {
      all: [schemaHooks.validateQuery(roomQueryValidator), schemaHooks.resolveQuery(roomQueryResolver)],
      find: [],
      get: [],
      create: [schemaHooks.validateData(roomDataValidator), schemaHooks.resolveData(roomDataResolver)],
      patch: [
        schemaHooks.validateData(roomPatchValidator),
        schemaHooks.resolveData(roomPatchResolver),
        assignCompaniesToRoom,
        unassignCompaniesFromQuery
      ],
      remove: [deleteEventsOnRoomRemove]
    },
    after: {
      all: []
    },
    error: {
      all: []
    }
  })
}
