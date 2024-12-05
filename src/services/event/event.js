// For more information about this file see https://dove.feathersjs.com/guides/cli/service.html
import { authenticate } from '@feathersjs/authentication'

import { hooks as schemaHooks } from '@feathersjs/schema'
import {
  eventDataValidator,
  eventPatchValidator,
  eventQueryValidator,
  eventResolver,
  eventExternalResolver,
  eventDataResolver,
  eventPatchResolver,
  eventQueryResolver
} from './event.schema.js'
import { EventService, getOptions } from './event.class.js'
import { populate } from 'feathers-hooks-common'
import { populateOrganizerAndLocation, validateCompanyEventTime } from '../../hooks/event.hook.js'

export const eventPath = 'event'
export const eventMethods = ['find', 'get', 'create', 'patch', 'remove']

export * from './event.class.js'
export * from './event.schema.js'

// A configure function that registers the service and its hooks via `app.configure`
export const event = (app) => {
  // Register our service on the Feathers application
  app.use(eventPath, new EventService(getOptions(app)), {
    // A list of all methods this service exposes externally
    methods: eventMethods,
    // You can add additional custom events to be sent to clients here
    events: []
  })
  // Initialize hooks
  app.service(eventPath).hooks({
    around: {
      all: [
        authenticate('jwt'),
        schemaHooks.resolveExternal(eventExternalResolver),
        schemaHooks.resolveResult(eventResolver)
      ]
    },
    before: {
      all: [schemaHooks.validateQuery(eventQueryValidator), schemaHooks.resolveQuery(eventQueryResolver)],
      find: [],
      get: [],
      create: [
        schemaHooks.validateData(eventDataValidator),
        schemaHooks.resolveData(eventDataResolver),
        validateCompanyEventTime()
      ],
      patch: [schemaHooks.validateData(eventPatchValidator), schemaHooks.resolveData(eventPatchResolver)],
      remove: []
    },
    after: {
      all: [],
      find: [populateOrganizerAndLocation()],
      create: [],
      patch: [],
      remove: []
    },
    error: {
      all: []
    }
  })
}
