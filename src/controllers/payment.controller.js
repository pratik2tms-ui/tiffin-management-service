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

module.exports = { getPayment, getPaymentsByCenter, recordPayment, getTransactions }