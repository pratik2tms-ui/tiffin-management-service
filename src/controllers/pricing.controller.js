const pricingService = require('../services/pricing.service')
const ServiceError = require('../utils/ServiceError')
const { success, error } = require('../utils/response')

const getPricing = async (req, res) => {
    try {
        const data = await pricingService.getActivePricing({ centerId: req.query.centerId })
        return success(res, data)
    } catch (err) {
        if (err instanceof ServiceError) return error(res, err.code, err.message, err.statusCode)
        console.error('Get pricing error:', err)
        return error(res, 'SERVER_ERROR', 'Could not fetch pricing', 500)
    }
}

const putPricing = async (req, res) => {
    try {
        const result = await pricingService.updatePricing({
            centerId: req.body.centerId,
            prices: req.body.prices,
            requester: req.user,
        })
        return success(res, result, 'Pricing updated')
    } catch (err) {
        if (err instanceof ServiceError) return error(res, err.code, err.message, err.statusCode)
        console.error('Update pricing error:', err)
        return error(res, 'SERVER_ERROR', 'Could not update pricing', 500)
    }
}

const listPricing = async (req, res) => {
    try {
        const centerId = req.user.role === 'center' ? req.user.centerId : req.query.centerId
        const result = await pricingService.listPricing({ centerId })
        return success(res, result.rows || result)
    } catch (err) {
        if (err instanceof ServiceError) return error(res, err.code, err.message, err.statusCode)
        console.error('List pricing error:', err)
        return error(res, 'SERVER_ERROR', 'Could not fetch pricing', 500)
    }
}

const createPricing = async (req, res) => {
    try {
        const centerId = req.user.role === 'center' ? req.user.centerId : req.body.centerId
        const result = await pricingService.createPricing({ ...req.body, centerId, requester: req.user })
        return success(res, result, 'Pricing created', 201)
    } catch (err) {
        if (err instanceof ServiceError) return error(res, err.code, err.message, err.statusCode)
        console.error('Create pricing error:', err)
        return error(res, 'SERVER_ERROR', 'Could not create pricing', 500)
    }
}

const updatePricingById = async (req, res) => {
    try {
        const result = await pricingService.updatePricingById(req.params.id, { ...req.body, requester: req.user })
        return success(res, result, 'Pricing updated')
    } catch (err) {
        if (err instanceof ServiceError) return error(res, err.code, err.message, err.statusCode)
        console.error('Update pricing error:', err)
        return error(res, 'SERVER_ERROR', 'Could not update pricing', 500)
    }
}

const deletePricing = async (req, res) => {
    try {
        const result = await pricingService.deletePricing(req.params.id, req.user)
        return success(res, result, 'Pricing deleted')
    } catch (err) {
        if (err instanceof ServiceError) return error(res, err.code, err.message, err.statusCode)
        console.error('Delete pricing error:', err)
        return error(res, 'SERVER_ERROR', 'Could not delete pricing', 500)
    }
}

const getPricingById = async (req, res) => {
    try {
        const result = await pricingService.getPricingById(req.params.id)
        return success(res, result)
    } catch (err) {
        if (err instanceof ServiceError) return error(res, err.code, err.message, err.statusCode)
        console.error('Get pricing by id error:', err)
        return error(res, 'SERVER_ERROR', 'Could not fetch pricing', 500)
    }
}

module.exports = { getPricing, putPricing, listPricing, createPricing, updatePricingById, deletePricing, getPricingById }