const { TiffinEntry, TiffinCenter, User } = require('../models')
const { Op } = require('sequelize')

const getMonthRange = (month) => {
    const targetMonth = month || new Date().toISOString().slice(0, 7)
    const [y, m] = targetMonth.split('-')
    const start = `${y}-${m}-01`
    const end = new Date(y, m, 0).toISOString().split('T')[0]
    return { [Op.between]: [start, end] }
}

const getAdminDashboard = async (dateRange) => {
    const totalTiffins = await TiffinEntry.count({
        where: { status: 'approved', isNoTiffin: false, entryDate: dateRange },
    })
    const pendingApprovals = await TiffinEntry.count({
        where: { status: 'pending', entryDate: dateRange },
    })
    const billingResult = await TiffinEntry.sum('amount', {
        where: { status: 'approved', isNoTiffin: false, entryDate: dateRange },
    })
    const activeCustomers = await User.count({
        where: { role: 'user', isActive: true, isDeleted: false },
    })

    return {
        totalTiffins,
        pendingApprovals,
        totalBilling: billingResult || 0,
        activeCustomers,
    }
}

const getCenterDashboard = async (requester, dateRange) => {
    const centerId = requester.centerId || (await TiffinCenter.findOne({ where: { ownerId: requester.id } }))?.id

    const pendingApprovals = await TiffinEntry.count({
        where: { centerId, status: 'pending', entryDate: dateRange },
    })
    const monthTotal = await TiffinEntry.sum('amount', {
        where: { centerId, status: 'approved', isNoTiffin: false, entryDate: dateRange },
    })
    const customersServed = await User.count({
        where: { centerId, role: 'user', isActive: true, isDeleted: false },
    })

    return {
        pendingApprovals,
        monthTotal: monthTotal || 0,
        customersServed,
    }
}

const getCustomerDashboard = async (requester, dateRange) => {
    const myTiffins = await TiffinEntry.count({
        where: { userId: requester.id, status: 'approved', isNoTiffin: false, entryDate: dateRange },
    })
    const myAmount = await TiffinEntry.sum('amount', {
        where: { userId: requester.id, status: 'approved', isNoTiffin: false, entryDate: dateRange },
    })
    const myPending = await TiffinEntry.count({
        where: { userId: requester.id, status: 'pending', entryDate: dateRange },
    })
    const myCenter = await TiffinCenter.findByPk(requester.centerId, {
        attributes: ['id', 'name', 'address', 'phone', 'avatar'],
    })

    return {
        myTiffins,
        myAmount: myAmount || 0,
        myPending,
        myCenter,
    }
}

const getDashboard = async ({ requester, month }) => {
    const dateRange = getMonthRange(month)

    if (requester.role === 'admin') return getAdminDashboard(dateRange)
    if (requester.role === 'center') return getCenterDashboard(requester, dateRange)
    return getCustomerDashboard(requester, dateRange)
}

const getBillingReport = async ({ centerId, month, userId, status }) => {
    const { TiffinEntry, User } = require('../models')
    const { Op } = require('sequelize')

    if (!centerId || !month) {
        const ServiceError = require('../utils/ServiceError')
        throw new ServiceError('VALIDATION_ERROR', 'centerId and month are required', 400)
    }

    const [y, m] = month.split('-')
    const start = `${y}-${m}-01`
    const end = new Date(y, m, 0).toISOString().split('T')[0]
    const dateRange = { [Op.between]: [start, end] }

    // ── Build filter for the entries table ──
    const entriesWhere = { centerId, entryDate: dateRange, isDeleted: false }
    if (userId && userId !== 'all') entriesWhere.userId = userId
    if (status && status !== 'all') entriesWhere.status = status

    const entries = await TiffinEntry.findAll({
        where: entriesWhere,
        include: [{ model: User, as: 'user', attributes: ['id', 'name'] }],
        order: [['entryDate', 'DESC']],
    })

    const formattedEntries = entries.map(e => ({
        id: e.id,
        date: e.entryDate,
        userId: e.userId,
        userName: e.user?.name || '',
        shift: e.shift,
        type: e.tiffinType,
        chapatiCount: e.chapatiCount,
        amount: parseFloat(e.amount),
        status: e.status,
    }))

    // ── Customer totals — always approved + non-no-tiffin, regardless of status filter ──
    // Uses month + center scoped query independent of the userId/status filter above
    const allCenterCustomers = await User.findAll({
        where: { centerId, role: 'user', isDeleted: false },
        attributes: ['id', 'name'],
    })

    const customerTotals = []
    for (const customer of allCenterCustomers) {
        const approvedEntries = await TiffinEntry.findAll({
            where: {
                centerId,
                userId: customer.id,
                entryDate: dateRange,
                status: 'approved',
                isNoTiffin: false,
                isDeleted: false,
            },
        })
        const total = approvedEntries.reduce((s, e) => s + parseFloat(e.amount), 0)
        customerTotals.push({
            userId: customer.id,
            name: customer.name,
            count: approvedEntries.length,
            total,
        })
    }

    const grandTotal = customerTotals.reduce((s, c) => s + c.total, 0)

    // ── Status counts — scoped to centerId + month + userId filter only (not status filter) ──
    const countsWhere = { centerId, entryDate: dateRange, isDeleted: false }
    if (userId && userId !== 'all') countsWhere.userId = userId

    const allEntriesForCounts = await TiffinEntry.findAll({ where: countsWhere })
    const statusCounts = {
        all: allEntriesForCounts.length,
        approved: allEntriesForCounts.filter(e => e.status === 'approved').length,
        pending: allEntriesForCounts.filter(e => e.status === 'pending').length,
        rejected: allEntriesForCounts.filter(e => e.status === 'rejected').length,
    }

    return {
        entries: formattedEntries,
        customerTotals,
        grandTotal,
        statusCounts,
    }
}

module.exports = { getDashboard, getBillingReport }