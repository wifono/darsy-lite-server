export const populateEventsForRoom = async (context) => {
  const { app, method, result, params } = context
  const eventService = app.service('event')
  const userService = app.service('users')
  const companyService = app.service('company')

  const attachEvents = async (room) => {
    if (!room._id) return room

    const events = await eventService.find({
      query: {
        location: room._id,
        $populate: ['organizer'],
        $limit: -1
      },
      paginate: false
    })

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
          return event
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

export const assignCompaniesToRoom = async (context) => {
  const { data, app, params } = context

  if (params.query.assign === 'company') {
    const companies = data.companies

    if (!companies || companies.length === 0) {
      throw new Error('No companies provided to assign')
    }

    const roomId = params.query.room

    if (!roomId) {
      throw new Error('Room ID is required to assign companies')
    }

    const roomService = app.service('room')
    const companyService = app.service('company')

    const room = await roomService.get(roomId)
    if (!room) {
      throw new Error('Room not found')
    }

    const existingCompanyIds = room.companies ? new Set(room.companies.map((id) => id.toString())) : new Set()
    const newCompanies = companies.filter((companyId) => !existingCompanyIds.has(companyId.toString()))

    if (newCompanies.length === 0) {
      console.log('All companies are already assigned to the room')
      context.result = room
      return context
    }

    const updatedCompanies = [...(room.companies || []), ...newCompanies]
    const updatedRoom = await roomService.patch(roomId, { companies: updatedCompanies })

    for (const companyId of newCompanies) {
      const company = await companyService.get(companyId)
      if (!company) {
        console.warn(`Company with ID ${companyId} not found`)
        continue
      }

      const companyRooms = company.rooms ? [...company.rooms, roomId] : [roomId]
      await companyService.patch(companyId, { rooms: [...new Set(companyRooms)] })
    }

    console.log(`Successfully assigned companies to room ${roomId} and updated companies`)
    context.result = updatedRoom
  }

  return context
}

export const unassignCompaniesFromQuery = async (context) => {
  const { app, params } = context

  if (params.query.unassign) {
    const companyId = params.query.unassign
    const roomId = params.query.room

    if (!roomId) {
      throw new Error('Room ID is required to unassign')
    }

    if (!companyId) {
      throw new Error('Company ID is required to unassign rooms')
    }

    const companyService = app.service('company')
    const roomService = app.service('room')

    const company = await companyService.get(companyId)
    if (!company) {
      throw new Error('Company not found')
    }

    console.log('Original company data:', company)

    const updatedRooms = (company.rooms || []).filter((id) => id.toString() !== roomId)

    console.log('Updated rooms for company:', updatedRooms)

    const updatedCompany = await companyService.patch(companyId, { rooms: updatedRooms })
    console.log('Patched company:', updatedCompany)

    const room = await roomService.get(roomId)
    if (room && room.companies && room.companies.includes(companyId)) {
      const updatedRoomCompanies = room.companies.filter((id) => id.toString() !== companyId)
      const updatedRoom = await roomService.patch(roomId, { companies: updatedRoomCompanies })
      console.log(`Room ${roomId} updated successfully:`, updatedRoom)
    }

    context.result = updatedCompany
  }

  return context
}
