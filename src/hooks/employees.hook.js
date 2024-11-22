export const assignUserToCompany = () => {
  return async (context) => {
    const { data, app } = context

    if (!data.companyId) {
      return context
    }

    const companyService = app.service('company')

    try {
      const company = await companyService.get(data.companyId)

      if (!company) {
        throw new Error('Company not found.')
      }

      const updatedEmployees = new Set(company.employees || [])
      updatedEmployees.add(context.result._id.toString())

      await companyService.patch(data.companyId, {
        employees: Array.from(updatedEmployees)
      })

      await app.service('users').patch(context.result._id, {
        companyId: data.companyId
      })

      context.result.message = 'User successfully assigned to the company.'
    } catch (error) {
      console.error('Error assigning user to company:', error)
      throw new Error('Failed to assign user to the company.')
    }

    return context
  }
}

export const removeUserFromCompany = () => {
  return async (context) => {
    const { id, app } = context

    if (!id) {
      return context
    }

    const companyService = app.service('company')
    const userService = app.service('users')

    try {
      const user = await userService.get(id)
      if (!user || !user.company) {
        return context
      }

      const companyId = user.company

      const company = await companyService.get(companyId)
      if (!company || !company.employees) {
        return context
      }

      const updatedEmployees = company.employees.filter((empId) => empId.toString() !== id.toString())

      await companyService.patch(companyId, { employees: updatedEmployees })

      console.log(`User ${id} removed from company ${companyId}`)
    } catch (error) {
      console.error(error)
      throw new Error('Error while removing user from company')
    }

    return context
  }
}

export const updateUserCompany = () => {
  return async (context) => {
    const { id, data, app } = context

    if (!data.companyId || !id) {
      return context
    }

    const companyService = app.service('company')
    const userService = app.service('users')

    try {
      const user = await userService.get(id)

      if (user.company) {
        const oldCompany = await companyService.get(user.company)

        if (oldCompany) {
          const oldEmployees = oldCompany.employees || []
          const updatedOldEmployees = oldEmployees.filter((emp) => emp.toString() !== id.toString())

          await companyService.patch(user.company, { employees: updatedOldEmployees })
        }
      }

      const newCompany = await companyService.get(data.companyId)

      if (!newCompany) {
        throw new Error('Company not found.')
      }

      const newEmployees = newCompany.employees || []
      if (!newEmployees.some((emp) => emp.toString() === id.toString())) {
        newEmployees.push(id)
      }

      await companyService.patch(data.companyId, { employees: newEmployees })

      await userService.patch(id, { company: data.companyId })

      context.result = {
        message: 'User successfully reassigned to the new company.',
        userId: id,
        companyId: data.companyId
      }
    } catch (error) {
      context.result = {
        message: error.message,
        userId: id,
        companyId: data.companyId
      }
    }

    return context
  }
}

export const populateCompany = () => {
  return async (context) => {
    const { app, result } = context
    const companyService = app.service('company')

    if (Array.isArray(result.data)) {
      for (let user of result.data) {
        if (user.company) {
          try {
            const company = await companyService.get(user.company)
            user.companyName = company.name
          } catch (error) {
            console.error('Error fetching company:', error)
          }
        }
      }
    } else if (result && !Array.isArray(result)) {
      const user = result
      if (user.company) {
        try {
          const company = await companyService.get(user.company)
          user.companyName = company.name
        } catch (error) {
          console.error('Error fetching company:', error)
        }
      }
    }

    return context
  }
}

export const assignEmployeesFromQuery = async (context) => {
  const { data, app, params } = context

  if (params.query.assign === 'employees') {
    const employees = data.employees

    if (!employees || employees.length === 0) {
      throw new Error('No employees provided to assign')
    }

    const companyId = params.query.company

    if (!companyId) {
      throw new Error('Company ID is required to assign employees')
    }

    const companyService = app.service('company')
    const userService = app.service('users')

    const company = await companyService.get(companyId)
    if (!company) {
      throw new Error('Company not found')
    }

    const existingEmployeeIds = company.employees
      ? new Set(company.employees.map((id) => id.toString()))
      : new Set()
    const newEmployees = employees.filter((employeeId) => !existingEmployeeIds.has(employeeId.toString()))

    if (newEmployees.length === 0) {
      console.log('All employees are already assigned to the company')
      context.result = company
      return context
    }

    const updatedEmployees = [...(company.employees || []), ...newEmployees]
    const updatedCompany = await companyService.patch(companyId, { employees: updatedEmployees })

    for (const employeeId of newEmployees) {
      const user = await userService.get(employeeId)
      if (!user) {
        console.warn(`User with ID ${employeeId} not found`)
        continue
      }

      await userService.patch(employeeId, { companyId })
    }

    console.log(`Successfully assigned employees to company ${companyId} and updated users`)
    context.result = updatedCompany
  }

  return context
}

export const unassignEmployeesFromQuery = async (context) => {
  const { app, params } = context

  if (params.query.unassign) {
    const employeeId = params.query.unassign
    const companyId = params.query.company

    if (!employeeId) {
      throw new Error('Employee ID is required to unassign')
    }

    if (!companyId) {
      throw new Error('Company ID is required to unassign employees')
    }

    const companyService = app.service('company')
    const userService = app.service('users')

    const company = await companyService.get(companyId)
    if (!company) {
      throw new Error('Company not found')
    }

    console.log('Original company data:', company)

    const updatedEmployees = company.employees.filter((id) => id.toString() !== employeeId)

    console.log('Updated employees:', updatedEmployees)

    const updatedCompany = await companyService.patch(companyId, { employees: updatedEmployees })
    console.log('Patched company:', updatedCompany)

    const user = await userService.get(employeeId)
    if (user && user.company && user.company.toString() === companyId) {
      await userService.patch(employeeId, { companyId: null, company: null })
      console.log(`User ${employeeId} updated successfully`)
    }

    context.result = updatedCompany
  }

  return context
}
