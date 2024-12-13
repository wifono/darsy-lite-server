export const populateOrganizerAndLocation = () => {
  return async (context) => {
    const { app, result } = context

    const userService = app.service('users')
    const roomService = app.service('room')
    const companyService = app.service('company')

    const processEvent = async (event) => {
      if (event.organizer) {
        try {
          const organizer = await userService.get(event.organizer)
          if (organizer.company) {
            const company = await companyService.get(organizer.company)
            event.organizerCompany = company?.name || 'Unknown Company'
            event.companyId = company._id || 'No ID'
          }
          event.organizerName = organizer?.name || 'Unknown Organizer'
        } catch (error) {
          console.error(`Error fetching organizer (${event.organizer}):`, error)
        }
      } else {
        console.warn(`Event ${event._id} has no organizer.`)
      }

      if (event.location) {
        try {
          const room = await roomService.get(event.location)
          event.locationName = room?.name || 'Unknown Location'
        } catch (error) {
          console.error(`Error fetching location (${event.location}):`, error)
        }
      } else {
        console.warn(`Event ${event._id} has no location.`)
      }

      if (event.start && event.end) {
        const startTime = Number(event.start)
        const endTime = Number(event.end)
        const totalTimeInSeconds = endTime - startTime
        event.totalTime = Math.round(totalTimeInSeconds / 60)
      } else {
        console.warn(`Event ${event._id} has invalid start or end time.`)
      }
    }

    if (Array.isArray(result.data)) {
      for (let event of result.data) {
        await processEvent(event)
      }
    } else if (result && !Array.isArray(result)) {
      await processEvent(result)
    }

    return context
  }
}

export const validateCompanyEventTime = () => async (context) => {
  const { app, data } = context

  if (!data.organizer || !data.start || !data.end) {
    throw new Error('Missing required event data (organizer, start, or end)')
  }

  try {
    const userService = app.service('users')
    const eventService = app.service('event')
    const companyService = app.service('company')

    const organizer = await userService.get(data.organizer)

    if (!organizer.company) {
      return context
    }

    const company = await companyService.get(organizer.company)

    if (!company.time) {
      throw new Error('Company does not have a defined time limit')
    }

    const companyTimeLimit = Number(company.time)

    const newEventDate = new Date(Number(data.start) * 1000)
    const monthStart = new Date(newEventDate.getFullYear(), newEventDate.getMonth(), 1)
    const monthEnd = new Date(newEventDate.getFullYear(), newEventDate.getMonth() + 1, 1)

    const events = await eventService.find({
      query: {
        company: organizer.companyId,
        start: {
          $gte: String(Math.floor(monthStart.getTime() / 1000)),
          $lt: String(Math.floor(monthEnd.getTime() / 1000))
        },
        $select: ['start', 'end']
      },
      paginate: false
    })

    const totalEventTime = events.reduce((total, event) => {
      const startTime = Number(event.start)
      const endTime = Number(event.end)
      return total + Math.round((endTime - startTime) / 60)
    }, 0)

    const newEventTime = Math.round((Number(data.end) - Number(data.start)) / 60)

    if (totalEventTime + newEventTime > companyTimeLimit) {
      throw new Error(
        `The total event time exceeds the company’s available time. Company: ${company.name} (${company._id})`
      )
    }
  } catch (error) {
    console.error('Error validating company event time:', error.message)
    context.result = {
      status: 'error',
      message: error.message,
      code: 400
    }
    return context
  }

  return context
}
