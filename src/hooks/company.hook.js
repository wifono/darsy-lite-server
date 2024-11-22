export const deleteCompanyAndRemoveFromUsers = () => {
  return async (context) => {
    const { id, app } = context
    const companyId = id

    if (!companyId) {
      throw new Error('Company ID is required')
    }

    const companyService = app.service('company')
    const userService = app.service('users')

    const company = await companyService.get(companyId)
    if (!company) {
      throw new Error('Company not found')
    }

    const users = await userService.find({
      query: {
        company: companyId
      }
    })

    if (users.data.length > 0) {
      for (const user of users.data) {
        try {
          await userService.patch(user._id, { company: null })
        } catch (err) {
          console.error(`Error updating user ${user._id}: ${err.message}`)
          throw new Error(`Error updating user ${user._id}: ${err.message}`)
        }
      }
    }

    return context
  }
}
