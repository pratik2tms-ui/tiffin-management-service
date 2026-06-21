const { Payment, TiffinEntry } = require('../models')
const ServiceError = require('../utils/ServiceError')
const { Op } = require('sequelize')

const calculateTotalDue = async (userId, centerId, month, year) => {
    const start = `${year}-${String(month).padStart(2, '0')}-01`
    const end = new Date(year, month, 0).toISOString().split('T')[0]

    const result = await TiffinEntry.sum('amount', {
        where: {
            userId, centerId,
            entryDate: { [Op.between]: [start, end] },
            status: 'approved',
            isNoTiffin: false,
            isDeleted: false,
        },
    })

    return result || 0
}

const getPayment = async ({ userId, centerId, month, year }) => {
    if (!userId || !centerId || !month || !year) {
        throw new ServiceError('VALIDATION_ERROR', 'userId, centerId, month, year are required', 400)
    }

    const payment = await Payment.findOne({
        where: { userId, centerId, periodMonth: month, periodYear: year, isDeleted: false },
    })

    if (!payment) return null

    return {
        id: payment.id,
        userId: payment.userId,
        centerId: payment.centerId,
        periodMonth: payment.periodMonth,
        periodYear: payment.periodYear,
        totalDue: parseFloat(payment.totalDue),
        amountPaid: parseFloat(payment.amountPaid),
        balanceDue: parseFloat(payment.totalDue) - parseFloat(payment.amountPaid),
        status: payment.status,
        paymentMethod: payment.paymentMethod,
        paymentReference: payment.paymentReference,
        paidAt: payment.paidAt,
        transactions: payment.transactions,
    }
}

const getPaymentsByCenter = async ({ centerId, month, year }) => {
    if (!centerId || !month || !year) {
        throw new ServiceError('VALIDATION_ERROR', 'centerId, month, year are required', 400)
    }

    const { User } = require('../models')

    // Get all customers of this center
    const customers = await User.findAll({
        where: { centerId, role: 'user', isDeleted: false },
        attributes: ['id', 'name'],
    })

    const results = []
    for (const customer of customers) {
        const totalDue = await calculateTotalDue(customer.id, centerId, month, year)
        const payment = await Payment.findOne({
            where: { userId: customer.id, centerId, periodMonth: month, periodYear: year, isDeleted: false },
        })
        const amountPaid = payment ? parseFloat(payment.amountPaid) : 0
        const balanceDue = Math.max(0, totalDue - amountPaid)
        const status = amountPaid === 0 ? 'unpaid' : balanceDue <= 0 ? 'paid' : 'partial'

        results.push({
            userId: customer.id,
            userName: customer.name,
            totalDue,
            amountPaid,
            balanceDue,
            status,
        })
    }

    return results
}

const recordPayment = async ({ userId, centerId, month, year, amount, method, reference, note, requester }) => {
    if (!userId || !centerId || !month || !year || !amount || !method) {
        throw new ServiceError('VALIDATION_ERROR', 'userId, centerId, month, year, amount, method are required', 400)
    }
    if (amount <= 0) {
        throw new ServiceError('VALIDATION_ERROR', 'Amount must be greater than 0', 400)
    }

    const totalDue = await calculateTotalDue(userId, centerId, month, year)

    let payment = await Payment.findOne({
        where: { userId, centerId, periodMonth: month, periodYear: year, isDeleted: false },
    })

    const currentPaid = payment ? parseFloat(payment.amountPaid) : 0
    const currentBalance = totalDue - currentPaid

    if (amount > currentBalance) {
        throw new ServiceError('AMOUNT_EXCEEDS_BALANCE', `Amount exceeds balance due ₹${currentBalance}`, 400)
    }

    const transaction = {
        id: Date.now(),
        amount,
        method,
        reference: reference || '',
        note: note || '',
        paidAt: new Date().toISOString(),
        recordedBy: requester.id,
        recordedByName: requester.name || requester.username,
    }

    if (payment) {
        const newAmountPaid = currentPaid + amount
        const newBalance = totalDue - newAmountPaid
        const newStatus = newBalance <= 0 ? 'paid' : 'partial'

        payment.totalDue = totalDue
        payment.amountPaid = newAmountPaid
        payment.status = newStatus
        payment.paymentMethod = method
        payment.paymentReference = reference || ''
        payment.paidAt = transaction.paidAt
        payment.transactions = [...payment.transactions, transaction]
        payment.modifiedBy = requester.id
        await payment.save()
    } else {
        const newBalance = totalDue - amount
        const newStatus = newBalance <= 0 ? 'paid' : 'partial'

        payment = await Payment.create({
            userId,
            centerId,
            periodMonth: month,
            periodYear: year,
            totalDue,
            amountPaid: amount,
            status: newStatus,
            paymentMethod: method,
            paymentReference: reference || '',
            paidAt: transaction.paidAt,
            notes: note || '',
            transactions: [transaction],
            createdBy: requester.id,
        })
    }

    return {
        id: payment.id,
        totalDue: parseFloat(payment.totalDue),
        amountPaid: parseFloat(payment.amountPaid),
        balanceDue: parseFloat(payment.totalDue) - parseFloat(payment.amountPaid),
        status: payment.status,
        transactions: payment.transactions,
    }
}

const getTransactions = async ({ paymentId }) => {
    const payment = await Payment.findByPk(paymentId)
    if (!payment) {
        throw new ServiceError('NOT_FOUND', 'Payment record not found', 404)
    }
    return payment.transactions
}

module.exports = { calculateTotalDue, getPayment, getPaymentsByCenter, recordPayment, getTransactions }