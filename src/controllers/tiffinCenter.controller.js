const tiffinCenterService = require('../services/tiffinCenter.service')
const ServiceError = require('../utils/ServiceError')
const { success, error } = require('../utils/response')

const getCenters = async (req, res) => {
    try {
        const data = await tiffinCenterService.listCenters()
        return success(res, data)
    } catch (err) {
        console.error('Get centers error:', err)
        return error(res, 'SERVER_ERROR', 'Could not fetch tiffin centers', 500)
    }
}

const getCenter = async (req, res) => {
    try {
        const data = await tiffinCenterService.getCenterById(req.params.id)
        return success(res, data)
    } catch (err) {
        if (err instanceof ServiceError) return error(res, err.code, err.message, err.statusCode)
        console.error('Get center error:', err)
        return error(res, 'SERVER_ERROR', 'Could not fetch tiffin center', 500)
    }
}

const getCenterCustomers = async (req, res) => {
    try {
        const data = await tiffinCenterService.getCenterCustomers(req.params.id)
        return success(res, data)
    } catch (err) {
        if (err instanceof ServiceError) return error(res, err.code, err.message, err.statusCode)
        console.error('Get center customers error:', err)
        return error(res, 'SERVER_ERROR', 'Could not fetch center customers', 500)
    }
}

const createCenter = async (req, res) => {
    try {
        const data = await tiffinCenterService.createCenter({ ...req.body, requester: req.user })
        return success(res, data, null, 201)
    } catch (err) {
        if (err instanceof ServiceError) return error(res, err.code, err.message, err.statusCode)
        console.error('Create center error:', err)
        return error(res, 'SERVER_ERROR', 'Could not create tiffin center', 500)
    }
}

const updateCenter = async (req, res) => {
    try {
        const data = await tiffinCenterService.updateCenter({ id: req.params.id, ...req.body, requester: req.user })
        return success(res, data)
    } catch (err) {
        if (err instanceof ServiceError) return error(res, err.code, err.message, err.statusCode)
        console.error('Update center error:', err)
        return error(res, 'SERVER_ERROR', 'Could not update tiffin center', 500)
    }
}

module.exports = { getCenters, getCenter, getCenterCustomers, createCenter, updateCenter }