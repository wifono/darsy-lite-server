// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve, getValidator, querySyntax } from '@feathersjs/schema'
import { ObjectIdSchema } from '@feathersjs/schema'
import { dataValidator, queryValidator } from '../../validators.js'

// Main data model schema
export const roomExportSchema = {
  $id: 'RoomExport',
  type: 'object',
  additionalProperties: false,
  required: ['_id', 'text'],
  properties: {
    _id: ObjectIdSchema(),
    text: { type: 'string' }
  }
}
export const roomExportValidator = getValidator(roomExportSchema, dataValidator)
export const roomExportResolver = resolve({})

export const roomExportExternalResolver = resolve({})

// Schema for creating new data
export const roomExportDataSchema = {
  $id: 'RoomExportData',
  type: 'object',
  additionalProperties: false,
  required: ['text'],
  properties: {
    ...roomExportSchema.properties
  }
}
export const roomExportDataValidator = getValidator(roomExportDataSchema, dataValidator)
export const roomExportDataResolver = resolve({})

// Schema for updating existing data
export const roomExportPatchSchema = {
  $id: 'RoomExportPatch',
  type: 'object',
  additionalProperties: false,
  required: [],
  properties: {
    ...roomExportSchema.properties
  }
}
export const roomExportPatchValidator = getValidator(roomExportPatchSchema, dataValidator)
export const roomExportPatchResolver = resolve({})

// Schema for allowed query properties
export const roomExportQuerySchema = {
  $id: 'RoomExportQuery',
  type: 'object',
  additionalProperties: false,
  properties: {
    ...querySyntax(roomExportSchema.properties)
  }
}
export const roomExportQueryValidator = getValidator(roomExportQuerySchema, queryValidator)
export const roomExportQueryResolver = resolve({})
