// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve, getValidator, querySyntax } from '@feathersjs/schema'
import { ObjectIdSchema } from '@feathersjs/schema'
import { dataValidator, queryValidator } from '../../validators.js'

// Main data model schema
export const roomSchema = {
  $id: 'Room',
  type: 'object',
  additionalProperties: true,
  required: ['number', 'name'],
  properties: {
    number: { type: 'string' },
    name: { type: 'string' },
    capacity: { type: 'string' },
    room: { type: 'string' },
    assign: { type: 'string' },
    companies: { type: 'array' },
    rooms: { type: 'string' },
    unassign: { type: 'string' }
  }
}
export const roomValidator = getValidator(roomSchema, dataValidator)
export const roomResolver = resolve({})

export const roomExternalResolver = resolve({})

// Schema for creating new data
export const roomDataSchema = {
  $id: 'RoomData',
  type: 'object',
  additionalProperties: false,
  required: ['name'],
  properties: {
    ...roomSchema.properties
  }
}
export const roomDataValidator = getValidator(roomDataSchema, dataValidator)
export const roomDataResolver = resolve({})

// Schema for updating existing data
export const roomPatchSchema = {
  $id: 'RoomPatch',
  type: 'object',
  additionalProperties: false,
  required: [],
  properties: {
    ...roomSchema.properties
  }
}
export const roomPatchValidator = getValidator(roomPatchSchema, dataValidator)
export const roomPatchResolver = resolve({})

// Schema for allowed query properties
export const roomQuerySchema = {
  $id: 'RoomQuery',
  type: 'object',
  additionalProperties: false,
  properties: {
    ...querySyntax(roomSchema.properties)
  }
}
export const roomQueryValidator = getValidator(roomQuerySchema, queryValidator)
export const roomQueryResolver = resolve({})
