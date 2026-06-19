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

module.exports = { getDashboard }