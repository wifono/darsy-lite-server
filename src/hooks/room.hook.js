export const populateEventsForRoom = async (context) => {
  const { app, method, result, params } = context
  const eventService = app.service('event')
  const userService = app.service('users')
  const companyService = app.service('company')

  const attachEvents = async (room) => {
    if (!room._id) return room

    // Získanie udalostí pre miestnosť
    const events = await eventService.find({
      query: {
        location: room._id,
        $populate: ['organizer'], // Môže byť automatické, ak to máte v service
        $limit: -1 // Získajte všetky udalosti
      },
      paginate: false
    })

    // Pre každú udalosť získajte informácie o organizátorovi a firme
    const detailedEvents = await Promise.all(
      events.map(async (event) => {
        try {
          const organizer = await userService.get(event.organizer)
          const company = organizer.company ? await companyService.get(organizer.company) : null

          return {
            ...event,
            organizerName: organizer.name,
            organizerCompany: company ? company.name : 'Unknown Company'
          }
        } catch (error) {
          console.error('Error populating event details:', error)
          return event // Vráti udalosť bez detailov
        }
      })
    )

    return { ...room, events: detailedEvents }
  }

  if (method === 'find') {
    if (Array.isArray(result)) {
      context.result = await Promise.all(result.map(attachEvents))
    } else {
      context.result = await attachEvents(result)
    }
  }

  return context
}
