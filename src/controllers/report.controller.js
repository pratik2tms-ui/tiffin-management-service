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

const getCustomerHistory = async (req, res) => {
    try {
        const data = await reportService.getCustomerHistory({
            userId: req.user.id,   // always the logged-in customer's own data
            months: req.query.months,
        })
        return success(res, data)
    } catch (err) {
        if (err instanceof ServiceError) return error(res, err.code, err.message, err.statusCode)
        console.error('Customer history error:', err)
        return error(res, 'SERVER_ERROR', 'Could not load history', 500)
    }
}

const getCenterTypeBreakdown = async (req, res) => {
    try {
        const centerId = req.user.role === 'center' ? req.user.centerId : req.query.centerId
        const data = await reportService.getCenterTypeBreakdown({
            centerId,
            month: req.query.month,
        })
        return success(res, data)
    } catch (err) {
        if (err instanceof ServiceError) return error(res, err.code, err.message, err.statusCode)
        console.error('Center type breakdown error:', err)
        return error(res, 'SERVER_ERROR', 'Could not load breakdown', 500)
    }
}

module.exports = { getDashboard, getBillingReport, getCustomerHistory, getCenterTypeBreakdown }