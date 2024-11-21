import { resolve, getValidator, querySyntax } from '@feathersjs/schema'
import { ObjectIdSchema } from '@feathersjs/schema'
import { dataValidator, queryValidator } from '../../validators.js'

// Main data model schema
export const eventSchema = {
  $id: 'Event',
  type: 'object',
  additionalProperties: false,
  required: ['_id', 'subject', 'start', 'end', 'location'],
  properties: {
    _id: ObjectIdSchema(),
    subject: { type: 'string' },
    start: { type: 'string' },
    end: { type: 'string' },
    location: {
      oneOf: [ObjectIdSchema(), { type: 'null' }]
    },
    organizer: { type: 'string' }
  }
}

export const eventValidator = getValidator(eventSchema, dataValidator)
export const eventResolver = resolve({
  location: async (value, context) => {
    const { app } = context
    if (value) {
      // Populate the location (Room) object
      const room = await app.service('rooms').get(value)
      return room
    }
    return value
  }
})

export const eventExternalResolver = resolve({})

// Schema for creating new data
export const eventDataSchema = {
  $id: 'EventData',
  type: 'object',
  additionalProperties: false,
  required: ['text'],
  properties: {
    ...eventSchema.properties
  }
}
export const eventDataValidator = getValidator(eventDataSchema, dataValidator)
export const eventDataResolver = resolve({})

// Schema for updating existing data
export const eventPatchSchema = {
  $id: 'EventPatch',
  type: 'object',
  additionalProperties: false,
  required: [],
  properties: {
    ...eventSchema.properties
  }
}
export const eventPatchValidator = getValidator(eventPatchSchema, dataValidator)
export const eventPatchResolver = resolve({})

// Schema for allowed query properties
export const eventQuerySchema = {
  $id: 'EventQuery',
  type: 'object',
  additionalProperties: false,
  properties: {
    ...querySyntax(eventSchema.properties)
  }
}
export const eventQueryValidator = getValidator(eventQuerySchema, queryValidator)
export const eventQueryResolver = resolve({})
