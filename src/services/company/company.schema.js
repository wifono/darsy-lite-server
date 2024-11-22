// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve, getValidator, querySyntax } from '@feathersjs/schema'
import { ObjectIdSchema } from '@feathersjs/schema'
import { dataValidator, queryValidator } from '../../validators.js'

// Main data model schema for Company
export const companySchema = {
  $id: 'Company',
  type: 'object',
  additionalProperties: true,
  required: ['_id'],
  properties: {
    _id: ObjectIdSchema(),
    name: { type: 'string' },
    time: { type: 'string' },
    usedTime: { type: 'string' },
    employees: {
      type: 'array',
      items: ObjectIdSchema()
    },
    assign: { type: 'string' },
    company: { type: 'string' },
    unassign: { type: 'string' },
    companyId: { oneOf: [{ type: 'string' }, { type: 'null' }] }
  }
}

export const companyValidator = getValidator(companySchema, dataValidator)
export const companyResolver = resolve({})

export const companyExternalResolver = resolve({})

// Schema for creating new Company data
export const companyDataSchema = {
  $id: 'CompanyData',
  type: 'object',
  additionalProperties: false,
  required: [],
  properties: {
    ...companySchema.properties,
    $addToSet: {
      type: 'object',
      additionalProperties: {
        type: 'array',
        items: ObjectIdSchema()
      }
    }
  }
}

export const companyDataValidator = getValidator(companyDataSchema, dataValidator)
export const companyDataResolver = resolve({})

// Schema for updating existing Company data
export const companyPatchSchema = {
  $id: 'CompanyPatch',
  type: 'object',
  additionalProperties: false,
  required: [],
  properties: {
    ...companySchema.properties
  }
}

export const companyPatchValidator = getValidator(companyPatchSchema, dataValidator)
export const companyPatchResolver = resolve({})

// Schema for allowed query properties
export const companyQuerySchema = {
  $id: 'CompanyQuery',
  type: 'object',
  additionalProperties: false,
  properties: {
    ...querySyntax(companySchema.properties)
  }
}

export const companyQueryValidator = getValidator(companyQuerySchema, queryValidator)
export const companyQueryResolver = resolve({})
