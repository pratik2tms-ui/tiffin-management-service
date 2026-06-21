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

module.exports = { getPricing, putPricing }