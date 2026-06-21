const reportService = require('../services/report.service')
const ServiceError = require('../utils/ServiceError')
const { success, error } = require('../utils/response')

const getDashboard = async (req, res) => {
    try {
        const data = await reportService.getDashboard({
            requester: req.user,
            month: req.query.month,
        })
        return success(res, data)
    } catch (err) {
        console.error('Dashboard error:', err)
        return error(res, 'SERVER_ERROR', 'Could not load dashboard data', 500)
    }
}

const getBillingReport = async (req, res) => {
    try {
        const data = await reportService.getBillingReport({
            centerId: req.query.centerId,
            month: req.query.month,
            userId: req.query.userId,
            status: req.query.status,
        })
        return success(res, data)
    } catch (err) {
        if (err instanceof ServiceError) return error(res, err.code, err.message, err.statusCode)
        console.error('Billing report error:', err)
        return error(res, 'SERVER_ERROR', 'Could not load billing report', 500)
    }
}

module.exports = { getDashboard, getBillingReport }