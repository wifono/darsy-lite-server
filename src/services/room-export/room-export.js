// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html

import { hooks as schemaHooks } from '@feathersjs/schema'
import {
  roomExportDataValidator,
  roomExportPatchValidator,
  roomExportQueryValidator,
  roomExportResolver,
  roomExportExternalResolver,
  roomExportDataResolver,
  roomExportPatchResolver,
  roomExportQueryResolver
} from './room-export.schema.js'
import { RoomExportService, getOptions } from './room-export.class.js'

export const roomExportPath = 'room-export'
export const roomExportMethods = ['find', 'get', 'create', 'patch', 'remove']

export * from './room-export.class.js'
export * from './room-export.schema.js'

// A configure function that registers the service and its hooks via `app.configure`
export const roomExport = (app) => {
  // Register our service on the Feathers application
  app.use(roomExportPath, new RoomExportService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: roomExportMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(roomExportPath).hooks({
    around: {
      all: [
        schemaHooks.resolveExternal(roomExportExternalResolver),
        schemaHooks.resolveResult(roomExportResolver)
      ]
    },
    before: {
      all: [
        schemaHooks.validateQuery(roomExportQueryValidator),
        schemaHooks.resolveQuery(roomExportQueryResolver)
      ],
      find: [],
      get: [],
      create: [
        schemaHooks.validateData(roomExportDataValidator),
        schemaHooks.resolveData(roomExportDataResolver)
      ],
      patch: [
        schemaHooks.validateData(roomExportPatchValidator),
        schemaHooks.resolveData(roomExportPatchResolver)
      ],
      remove: []
    },
    after: {
      all: []
    },
    error: {
      all: []
    }
  })
}
