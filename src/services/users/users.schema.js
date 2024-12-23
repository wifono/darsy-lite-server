// For more information about this file see https://dove.feathersjs.com/guides/cli/service.schemas.html
import { resolve, getValidator, querySyntax } from '@feathersjs/schema'
import { ObjectIdSchema } from '@feathersjs/schema'
import { passwordHash } from '@feathersjs/authentication-local'
import { dataValidator, queryValidator } from '../../validators.js'

// Main data model schema
// Main data model schema for User (Employee)
export const userSchema = {
  $id: 'User',
  type: 'object',
  additionalProperties: true,
  required: ['_id', 'email'],
  properties: {
    _id: ObjectIdSchema(),
    email: { type: 'string' },
    name: { type: 'string' },
    role: { type: 'string' },
    password: { type: 'string' },
    company: {
      oneOf: [ObjectIdSchema(), { type: 'null' }]
    },
    companyId: { oneOf: [{ type: 'string' }, { type: 'null' }] }
  }
}

export const userValidator = getValidator(userSchema, dataValidator)
export const userResolver = resolve({
  // company: async (value, context) => {
  //   const { app } = context
  //   if (value) {
  //     const company = await app.service('companies').get(value)
  //     return company
  //   }
  //   return value
  // }
})

export const userExternalResolver = resolve({
  password: async () => undefined
})

// Schema for creating new data
export const userDataSchema = {
  $id: 'UserData',
  type: 'object',
  additionalProperties: false,
  required: ['email'],
  properties: {
    ...userSchema.properties
  }
}
export const userDataValidator = getValidator(userDataSchema, dataValidator)
export const userDataResolver = resolve({
  password: passwordHash({ strategy: 'local' })
})

// Schema for updating existing data
export const userPatchSchema = {
  $id: 'UserPatch',
  type: 'object',
  additionalProperties: false,
  required: [],
  properties: {
    ...userSchema.properties,
    userId: { type: 'string' }
  }
}
export const userPatchValidator = getValidator(userPatchSchema, dataValidator)
export const userPatchResolver = resolve({
  password: passwordHash({ strategy: 'local' })
})

// Schema for allowed query properties
export const userQuerySchema = {
  $id: 'UserQuery',
  type: 'object',
  additionalProperties: false,
  properties: {
    ...querySyntax(userSchema.properties)
  }
}
export const userQueryValidator = getValidator(userQuerySchema, queryValidator)
export const userQueryResolver = resolve({})
