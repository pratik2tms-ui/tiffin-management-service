const { TiffinEntry, Approval } = require('../models')
const ServiceError = require('../utils/ServiceError')

const getPendingApprovals = async ({ centerId, page = 1, limit = 10 }) => {
    if (!centerId) {
        throw new ServiceError('VALIDATION_ERROR', 'centerId is required', 400)
    }
    const { User } = require('../models')

    const offset = (page - 1) * limit
    const { rows, count } = await TiffinEntry.findAndCountAll({
        where: { centerId, status: 'pending', isDeleted: false },
        include: [{ model: User, as: 'user', attributes: ['id', 'name'] }],
        order: [['entryDate', 'ASC']],
        limit: parseInt(limit),
        offset: parseInt(offset),
    })

    return {
        data: rows,
        pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: count,
            totalPages: Math.ceil(count / limit),
        },
    }
}

const reviewEntry = async ({ entryId, action, reason, requester }) => {
    const entry = await TiffinEntry.findByPk(entryId)
    if (!entry) {
        throw new ServiceError('NOT_FOUND', 'Tiffin entry not found', 404)
    }
    if (entry.status !== 'pending') {
        throw new ServiceError('CONFLICT', 'Entry is not in pending state', 409)
    }

    const previousStatus = entry.status
    entry.status = action
    entry.modifiedBy = requester.id
    if (action === 'approved') {
        entry.approvedBy = requester.id
        entry.approvedAt = new Date()
    }
    await entry.save()

    await Approval.create({
        entryId: entry.id,
        reviewedBy: requester.id,
        centerId: entry.centerId,
        action,
        previousStatus,
        newStatus: action,
        reason: reason || '',
        createdBy: requester.id,
    })

    return entry
}

module.exports = { getPendingApprovals, reviewEntry }