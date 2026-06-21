const bcrypt = require('bcryptjs')
const { User, TiffinEntry, Payment } = require('../models')
const ServiceError = require('../utils/ServiceError')
const { calculateTotalDue } = require('./payment.service')

const listUsers = async ({ centerId, role }) => {
    const where = { isDeleted: false }
    if (centerId) where.centerId = centerId
    if (role) where.role = role

    return User.findAll({
        where,
        attributes: ['id', 'name', 'username', 'centerId', 'avatar', 'phone', 'role', 'isActive'],
        order: [['name', 'ASC']],
    })
}

const getUserById = async (id) => {
    const user = await User.findOne({
        where: { id, isDeleted: false },
        attributes: ['id', 'uuid', 'name', 'username', 'centerId', 'avatar', 'phone', 'role', 'isActive'],
    })
    if (!user) {
        throw new ServiceError('NOT_FOUND', 'User not found', 404)
    }
    return user
}

const getUserStats = async ({ userId, month, year }) => {
    const user = await User.findByPk(userId)
    if (!user) {
        throw new ServiceError('NOT_FOUND', 'User not found', 404)
    }

    const targetMonth = month || new Date().getMonth() + 1
    const targetYear = year || new Date().getFullYear()
    const start = `${targetYear}-${String(targetMonth).padStart(2, '0')}-01`
    const end = new Date(targetYear, targetMonth, 0).toISOString().split('T')[0]

    const { Op } = require('sequelize')

    const entries = await TiffinEntry.findAll({
        where: { userId, entryDate: { [Op.between]: [start, end] }, isDeleted: false },
    })

    const approved = entries.filter(e => e.status === 'approved' && !e.isNoTiffin)
    const pending = entries.filter(e => e.status === 'pending')
    const totalAmount = approved.reduce((s, e) => s + parseFloat(e.amount), 0)

    const typeCounts = {}
    approved.forEach(e => {
        typeCounts[e.tiffinType] = (typeCounts[e.tiffinType] || 0) + 1
    })
    const favouriteType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || null

    const totalDue = await calculateTotalDue(userId, user.centerId, targetMonth, targetYear)
    const payment = await Payment.findOne({
        where: { userId, centerId: user.centerId, periodMonth: targetMonth, periodYear: targetYear, isDeleted: false },
    })
    const amountPaid = payment ? parseFloat(payment.amountPaid) : 0
    const balanceDue = Math.max(0, totalDue - amountPaid)
    const paymentStatus = amountPaid === 0 ? 'unpaid' : balanceDue <= 0 ? 'paid' : 'partial'

    return {
        approvedCount: approved.length,
        pendingCount: pending.length,
        totalAmount,
        favouriteType,
        payment: { totalDue, amountPaid, balanceDue, status: paymentStatus },
    }
}

const createUser = async ({ name, username, password, phone, centerId, role, requester }) => {
    if (!name || !username || !password) {
        throw new ServiceError('VALIDATION_ERROR', 'name, username, password are required', 400)
    }

    const existing = await User.findOne({ where: { username } })
    if (existing) {
        throw new ServiceError('CONFLICT', 'Username already taken', 409)
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const user = await User.create({
        name,
        username,
        passwordHash,
        phone: phone || null,
        centerId: centerId || null,
        role: role || 'user',
        avatar: name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2),
        createdBy: requester.id,
    })

    return {
        id: user.id,
        name: user.name,
        username: user.username,
        centerId: user.centerId,
        avatar: user.avatar,
    }
}

const updateUser = async ({ id, name, phone, isActive, requester }) => {
    const user = await User.findOne({ where: { id, isDeleted: false } })
    if (!user) {
        throw new ServiceError('NOT_FOUND', 'User not found', 404)
    }

    if (name !== undefined) user.name = name
    if (phone !== undefined) user.phone = phone
    if (isActive !== undefined) user.isActive = isActive
    user.modifiedBy = requester.id

    await user.save()

    return {
        id: user.id, name: user.name, phone: user.phone, isActive: user.isActive,
    }
}

const deleteUser = async ({ id, requester }) => {
    const user = await User.findOne({ where: { id, isDeleted: false } })
    if (!user) {
        throw new ServiceError('NOT_FOUND', 'User not found', 404)
    }

    user.isDeleted = true
    user.isActive = false
    user.modifiedBy = requester.id
    await user.save()

    return true
}

module.exports = { listUsers, getUserById, getUserStats, createUser, updateUser, deleteUser }