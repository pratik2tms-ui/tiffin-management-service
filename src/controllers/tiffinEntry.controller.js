const tiffinEntryService = require('../services/tiffinEntry.service')
const { success, error } = require('../utils/response')

const addTiffin = async (req, res) => {
    try {
        const entry = await tiffinEntryService.createTiffinEntry({
            ...req.body,
            requester: req.user,
        })
        return success(res, entry, null, 201)
    } catch (err) {
        if (err instanceof tiffinEntryService.ServiceError) {
            return error(res, err.code, err.message, err.statusCode)
        }
        console.error('Add tiffin error:', err)
        return error(res, 'SERVER_ERROR', 'Could not add tiffin entry', 500)
    }
}

const markNoTiffin = async (req, res) => {
    try {
        const entry = await tiffinEntryService.createNoTiffinEntry({
            ...req.body,
            requester: req.user,
        })
        return success(res, entry, null, 201)
    } catch (err) {
        if (err instanceof tiffinEntryService.ServiceError) {
            return error(res, err.code, err.message, err.statusCode)
        }
        console.error('Mark no tiffin error:', err)
        return error(res, 'SERVER_ERROR', 'Could not mark no tiffin', 500)
    }
}

const getTiffinEntries = async (req, res) => {
    try {
        const { rows, pagination } = await tiffinEntryService.listTiffinEntries(req.query)
        return success(res, rows, null, 200, pagination)
    } catch (err) {
        if (err instanceof tiffinEntryService.ServiceError) {
            return error(res, err.code, err.message, err.statusCode)
        }
        console.error('Get entries error:', err)
        return error(res, 'SERVER_ERROR', 'Could not fetch entries', 500)
    }
}

module.exports = { addTiffin, markNoTiffin, getTiffinEntries }