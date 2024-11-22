export const populateOrganizerAndLocation = () => {
  return async (context) => {
    const { app, result } = context

    const userService = app.service('users')
    const roomService = app.service('room')
    const companyService = app.service('company')

    if (Array.isArray(result.data)) {
      for (let event of result.data) {
        if (event.organizer) {
          try {
            const organizer = await userService.get(event.organizer)
            const company = await companyService.get(organizer.company)
            const room = await roomService.get(event.location)

            event.organizerName = organizer?.name
            event.organizerCompany = company?.name
            event.locationName = room?.name

            const startTime = Number(event.start)
            const endTime = Number(event.end)
            const totalTimeInSeconds = endTime - startTime
            event.totalTime = Math.round(totalTimeInSeconds / 60)
          } catch (error) {
            console.error('Error fetching organizer or company:', error)
          }
        }
      }
    } else if (result && !Array.isArray(result)) {
      const event = result
      if (event.organizer) {
        try {
          const organizer = await userService.get(event.organizer)
          const company = await companyService.get(organizer.company)
          const room = await roomService.get(event.location)

          event.organizerName = organizer?.name
          event.organizerCompany = company?.name
          event.locationName = room?.name

          const startTime = Number(event.start)
          const endTime = Number(event.end)
          const totalTimeInSeconds = endTime - startTime
          event.totalTime = Math.round(totalTimeInSeconds / 60)
        } catch (error) {
          console.error('Error fetching organizer or company:', error)
        }
      }
      if (event.location) {
        try {
          const location = await roomService.get(event.location)
          event.locationName = location.name
        } catch (error) {
          console.error('Error fetching location:', error)
        }
      }
    }

    return context
  }
}

export const updateCompanyUsedTime = () => async (context) => {
  const { app, result } = context

  if (!result) {
    throw new Error('No event data available in the result')
  }

  const event = Array.isArray(result) ? result[0] : result

  if (event.organizer) {
    try {
      const userService = app.service('users')
      const companyService = app.service('company')

      const organizer = await userService.get(event.organizer)
      const company = await companyService.get(organizer.company)

      const startTime = Number(event.start)
      const endTime = Number(event.end)
      const totalTimeInSeconds = endTime - startTime
      const totalTimeInMinutes = Math.round(totalTimeInSeconds / 60)

      const currentUsedTime = company.usedTime ? Number(company.usedTime) : 0
      const availableTime = Number(company.time)

      if (currentUsedTime + totalTimeInMinutes > availableTime) {
        context.result = {
          status: 'error',
          message: 'Not enough available time to create this event',
          code: 400
        }
        return context
      }

      const updatedUsedTime = currentUsedTime + totalTimeInMinutes

      const updatedCompany = await companyService.patch(company._id, {
        usedTime: String(updatedUsedTime)
      })

      console.log('Company used time updated (event created):', updatedCompany.usedTime)
    } catch (error) {
      console.error('Error updating company usedTime on event creation:', error)
      context.result = {
        status: 'error',
        message: 'Error updating company usedTime on event creation',
        code: 404
      }
      return context
    }
  }

  return context
}

export const updateCompanyUsedTimeOnDelete = () => async (context) => {
  const { app, result } = context

  if (!result) {
    throw new Error('No event data available in the result')
  }

  const event = Array.isArray(result) ? result[0] : result

  if (event.organizer) {
    try {
      const userService = app.service('users')
      const companyService = app.service('company')

      const organizer = await userService.get(event.organizer)
      const company = await companyService.get(organizer.company)

      const startTime = Number(event.start)
      const endTime = Number(event.end)
      const totalTimeInSeconds = endTime - startTime
      const totalTimeInMinutes = Math.round(totalTimeInSeconds / 60)

      const currentUsedTime = company.usedTime ? Number(company.usedTime) : 0

      const updatedUsedTime = currentUsedTime - totalTimeInMinutes

      const updatedCompany = await companyService.patch(company._id, {
        usedTime: String(updatedUsedTime)
      })

      console.log('Company used time updated (event deleted):', updatedCompany.usedTime)
    } catch (error) {
      console.error('Error updating company usedTime on event deletion:', error)
      context.result = {
        status: 'error',
        message: 'Error updating company usedTime on event deletion',
        code: 404
      }
      return context
    }
  }

  return context
}
