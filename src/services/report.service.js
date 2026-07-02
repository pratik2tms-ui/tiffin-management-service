const { TiffinEntry, TiffinCenter, Pricing, User } = require('../models')
const { Op } = require('sequelize')
const ServiceError = require('../utils/ServiceError')

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

const getCustomerHistory = async ({ userId, months = 6 }) => {
    if (!userId) {
        throw new ServiceError('VALIDATION_ERROR', 'userId is required', 400)
    }

    const userIdInt = parseInt(userId, 10)
    if (isNaN(userIdInt)) {
        throw new ServiceError('VALIDATION_ERROR', 'userId must be a valid number', 400)
    }

    const defaultResponse = {
        months: [],
        typeBreakdown: [],
    }

    try {
        const results = []
        const now = new Date()

        for (let i = months - 1; i >= 0; i--) {
            const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
            const y = d.getFullYear()
            const m = d.getMonth() + 1
            const start = `${y}-${String(m).padStart(2, '0')}-01`
            const end = new Date(y, m, 0).toISOString().split('T')[0]

            const entries = await TiffinEntry.findAll({
                where: {
                    userId: userIdInt,
                    entryDate: { [Op.between]: [start, end] },
                    status: 'approved',
                    isNoTiffin: false,
                    isDeleted: false,
                },
            })

            const count = entries.length
            const amount = entries.reduce((s, e) => s + parseFloat(e.amount || 0), 0)

            results.push({
                month: m,
                year: y,
                label: d.toLocaleString('en-IN', { month: 'short' }),
                count,
                amount: parseFloat(amount.toFixed(2)),
            })
        }

        if (!results.length) return defaultResponse

        const rangeStart = `${results[0].year}-${String(results[0].month).padStart(2, '0')}-01`
        const lastResult = results[results.length - 1]
        const rangeEnd = new Date(lastResult.year, lastResult.month, 0).toISOString().split('T')[0]

        const allEntries = await TiffinEntry.findAll({
            where: {
                userId: userIdInt,
                entryDate: { [Op.between]: [rangeStart, rangeEnd] },
                status: 'approved',
                isNoTiffin: false,
                isDeleted: false,
            },
        })

        let typeBreakdown = []

        if (allEntries.length > 0) {
            const typeCounts = {}
            allEntries.forEach(e => {
                if (e.tiffinType) {
                    typeCounts[e.tiffinType] = (typeCounts[e.tiffinType] || 0) + 1
                }
            })

            typeBreakdown = Object.entries(typeCounts)
                .map(([type, count]) => ({
                    type,
                    count,
                    percentage: Math.round((count / allEntries.length) * 100),
                }))
                .sort((a, b) => b.count - a.count)
        }

        return { months: results, typeBreakdown }

    } catch (err) {
        console.error('[getCustomerHistory] Error:', err)
        return defaultResponse
    }
}

const getCenterTypeBreakdown = async ({ centerId, month }) => {
    if (!centerId) {
        throw new ServiceError('VALIDATION_ERROR', 'centerId is required', 400)
    }

    const centerIdInt = parseInt(centerId, 10)
    if (isNaN(centerIdInt)) {
        throw new ServiceError('VALIDATION_ERROR', 'centerId must be a valid number', 400)
    }

    const center = await TiffinCenter.findByPk(centerIdInt)
    if (!center) {
        throw new ServiceError('NOT_FOUND', 'Tiffin center not found', 404)
    }

    const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1)

    try {
        const dateRange = getMonthRange(month)

        const pricingRows = await Pricing.findAll({
            where: { centerId, isActive: true, isDeleted: false, effectiveTo: null },
        })

        const pricingTypes = [...new Set(
            pricingRows
                .map(p => p.tiffinType || p.tiffin_type)
                .filter(Boolean)
        )]

        const buildDefault = (types) => ({
            breakdown: types.map(type => ({ type: capitalize(type), count: 0, amount: 0, percentage: 0 })),
            totalCount: 0,
            totalAmount: 0,
        })

        if (!pricingTypes.length) return buildDefault([])

        const entries = await TiffinEntry.findAll({
            where: {
                centerId: centerIdInt,
                entryDate: dateRange,
                status: 'approved',
                isNoTiffin: false,
                isDeleted: false,
            },
        })

        if (!entries.length) return buildDefault(pricingTypes)

        const totalCount = entries.length
        const totalAmount = parseFloat(
            entries.reduce((s, e) => s + parseFloat(e.amount || 0), 0).toFixed(2)
        )

        const breakdown = pricingTypes
            .map(type => {
                const typeEntries = entries.filter(e => e.tiffinType === type)
                return {
                    type: capitalize(type),
                    count: typeEntries.length,
                    amount: parseFloat(
                        typeEntries.reduce((s, e) => s + parseFloat(e.amount || 0), 0).toFixed(2)
                    ),
                    percentage: Math.round((typeEntries.length / totalCount) * 100),
                }
            })
            .sort((a, b) => b.count - a.count)

        return { breakdown, totalCount, totalAmount }

    } catch (err) {
        console.error('[getCenterTypeBreakdown] Error:', err)
        return { breakdown: [], totalCount: 0, totalAmount: 0 }
    }
}

module.exports = { getDashboard, getBillingReport, getCustomerHistory, getCenterTypeBreakdown }