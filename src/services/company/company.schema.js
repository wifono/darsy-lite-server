// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve, getValidator, querySyntax } from '@feathersjs/schema'
import { ObjectIdSchema } from '@feathersjs/schema'
import { dataValidator, queryValidator } from '../../validators.js'

// Main data model schema for Company
export const companySchema = {
  $id: 'Company',
  type: 'object',
  additionalProperties: false,
  required: ['_id', 'name', 'time'],
  properties: {
    _id: ObjectIdSchema(),
    name: { type: 'string' },
    time: { type: 'string' },
    usedTime: { type: 'string' },
    employees: {
      type: 'array',
      items: ObjectIdSchema()
    }
  }
}

export const companyValidator = getValidator(companySchema, dataValidator)
export const companyResolver = resolve({
  employees: async (value, context) => {
    // Optional resolver to populate employee data if necessary
    const { app } = context
    if (value && value.length) {
      const users = await app.service('users').find({
        query: { _id: { $in: value } }
      })
      return users.data
    }
    return value
  }
})

export const companyExternalResolver = resolve({})

// Schema for creating new Company data
export const companyDataSchema = {
  $id: 'CompanyData',
  type: 'object',
  additionalProperties: false,
  required: ['name', 'time'],
  properties: {
    ...companySchema.properties,
    employees: {
      type: 'array',
      items: ObjectIdSchema() // Optional when creating
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
