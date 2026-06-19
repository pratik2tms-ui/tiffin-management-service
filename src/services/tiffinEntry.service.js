const { TiffinEntry, Pricing, User } = require('../models')
const ServiceError = require('../utils/ServiceError')
const calculateAmount = require('../utils/calculateAmount')
const { Op } = require('sequelize')

const toDateStr = (d) => {
    const yyyy = d.getFullYear()
    const mm = String(d.getMonth() + 1).padStart(2, '0')
    const dd = String(d.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
}

const validateCustomerDate = (date) => {
    const now = new Date()
    const todayStr = toDateStr(now)

    const tomorrow = new Date(now)
    tomorrow.setDate(now.getDate() + 1)
    const tomorrowStr = toDateStr(tomorrow)

    if (date !== todayStr && date !== tomorrowStr) {
        throw new ServiceError(
            'INVALID_DATE',
            `Customers can only add tiffin for today (${todayStr}) or tomorrow (${tomorrowStr})`,
            400
        )
    }
}

const createTiffinEntry = async ({ userId, date, shift, type, chapatiCount, note, requester }) => {
    if (!userId || !date || !type) {
        throw new ServiceError('VALIDATION_ERROR', 'userId, date, and type are required', 400)
    }

    // Date restriction only applies to customers
    if (requester.role === 'user') {
        validateCustomerDate(date)
    }

    const targetUser = await User.findByPk(userId)
    if (!targetUser) {
        throw new ServiceError('NOT_FOUND', 'Customer not found', 404)
    }

    const centerId = targetUser.centerId
    const pricing = await Pricing.findOne({
        where: { centerId, tiffinType: type, isActive: true, isDeleted: false },
    })
    if (!pricing) {
        throw new ServiceError('NOT_FOUND', 'No active pricing found for this tiffin type', 404)
    }

    const amount = calculateAmount(pricing, type, chapatiCount || 0)
    const status = requester.role === 'center' ? 'approved' : 'pending'

    const entry = await TiffinEntry.create({
        userId,
        centerId,
        pricingId: pricing.id,
        entryDate: date,
        shift: shift || 'morning',
        tiffinType: type,
        chapatiCount: chapatiCount || 0,
        amount,
        status,
        addedByRole: requester.role,
        note: note || '',
        approvedBy: status === 'approved' ? requester.id : null,
        approvedAt: status === 'approved' ? new Date() : null,
        createdBy: requester.id,
    })

    return entry
}

const createNoTiffinEntry = async ({ userId, date, requester }) => {
    if (!userId || !date) {
        throw new ServiceError('VALIDATION_ERROR', 'userId and date are required', 400)
    }

    const targetUser = await User.findByPk(userId)
    if (!targetUser) {
        throw new ServiceError('NOT_FOUND', 'Customer not found', 404)
    }

    const entry = await TiffinEntry.create({
        userId,
        centerId: targetUser.centerId,
        entryDate: date,
        shift: 'morning',
        tiffinType: 'full',
        chapatiCount: 0,
        amount: 0,
        status: 'approved',
        addedByRole: requester.role,
        isNoTiffin: true,
        note: 'No tiffin',
        createdBy: requester.id,
    })

    return entry
}

const listTiffinEntries = async ({ userId, centerId, month, status, shift, page = 1, limit = 10 }) => {
    const where = { isDeleted: false }

    if (userId) where.userId = userId
    if (centerId) where.centerId = centerId
    if (status) where.status = status
    if (shift) where.shift = shift
    if (month) {
        const [y, m] = month.split('-')
        const start = `${y}-${m}-01`
        const end = new Date(y, m, 0).toISOString().split('T')[0]
        where.entryDate = { [Op.between]: [start, end] }
    }

    const offset = (page - 1) * limit
    const { rows, count } = await TiffinEntry.findAndCountAll({
        where,
        include: [{ model: User, as: 'user', attributes: ['id', 'name'] }],
        order: [['entryDate', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset),
    })

    return {
        rows,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: count,
            totalPages: Math.ceil(count / limit),
        },
    }
}

module.exports = {
    createTiffinEntry,
    createNoTiffinEntry,
    listTiffinEntries,
}