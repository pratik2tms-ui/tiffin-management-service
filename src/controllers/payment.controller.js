const paymentService = require('../services/payment.service')
const ServiceError = require('../utils/ServiceError')
const { success, error } = require('../utils/response')

const getPayment = async (req, res) => {
    try {
        const data = await paymentService.getPayment({
            userId: req.query.userId,
            centerId: req.query.centerId,
            month: req.query.month,
            year: req.query.year,
        })
        return success(res, data)
    } catch (err) {
        if (err instanceof ServiceError) return error(res, err.code, err.message, err.statusCode)
        console.error('Get payment error:', err)
        return error(res, 'SERVER_ERROR', 'Could not fetch payment', 500)
    }
}

const getPaymentsByCenter = async (req, res) => {
    try {
        const data = await paymentService.getPaymentsByCenter({
            centerId: req.params.centerId,
            month: req.query.month,
            year: req.query.year,
        })
        return success(res, data)
    } catch (err) {
        if (err instanceof ServiceError) return error(res, err.code, err.message, err.statusCode)
        console.error('Get payments by center error:', err)
        return error(res, 'SERVER_ERROR', 'Could not fetch payments', 500)
    }
}

const recordPayment = async (req, res) => {
    try {
        const data = await paymentService.recordPayment({
            ...req.body,
            requester: req.user,
        })
        return success(res, data, null, 201)
    } catch (err) {
        if (err instanceof ServiceError) return error(res, err.code, err.message, err.statusCode)
        console.error('Record payment error:', err)
        return error(res, 'SERVER_ERROR', 'Could not record payment', 500)
    }
}

const getTransactions = async (req, res) => {
    try {
        const data = await paymentService.getTransactions({ paymentId: req.params.id })
        return success(res, data)
    } catch (err) {
        if (err instanceof ServiceError) return error(res, err.code, err.message, err.statusCode)
        console.error('Get transactions error:', err)
        return error(res, 'SERVER_ERROR', 'Could not fetch transactions', 500)
    }
}

const listPayments = async (req, res) => {
    try {
        const { centerId, month, page, limit } = req.query
        const userId = req.user.role === 'user' ? req.user.id : req.query.userId
        const rows = await paymentService.listPayments({ userId, centerId, month, page, limit })
        return success(res, rows)
    } catch (err) {
        if (err instanceof ServiceError) return error(res, err.code, err.message, err.statusCode)
        console.error('List payments error:', err)
        return error(res, 'SERVER_ERROR', 'Could not fetch payments', 500)
    }
}

const countPayments = async (req, res) => {
    try {
        const { centerId, month } = req.query
        const userId = req.user.role === 'user' ? req.user.id : req.query.userId
        const stats = await paymentService.countPayments({ userId, centerId, month })
        return success(res, stats)
    } catch (err) {
        if (err instanceof ServiceError) return error(res, err.code, err.message, err.statusCode)
        console.error('Count payments error:', err)
        return error(res, 'SERVER_ERROR', 'Could not count payments', 500)
    }
}

module.exports = { getPayment, getPaymentsByCenter, recordPayment, getTransactions, listPayments, countPayments }