const approvalService = require('../services/approval.service')
const ServiceError = require('../utils/ServiceError')
const { success, error } = require('../utils/response')

const getPendingApprovals = async (req, res) => {
    try {
        const entries = await approvalService.getPendingApprovals(req.query)
        return success(res, entries)
    } catch (err) {
        if (err instanceof ServiceError) return error(res, err.code, err.message, err.statusCode)
        console.error('Get pending approvals error:', err)
        return error(res, 'SERVER_ERROR', 'Could not fetch pending approvals', 500)
    }
}

const approveEntry = async (req, res) => {
    try {
        const entry = await approvalService.reviewEntry({
            entryId: req.params.id,
            action: 'approved',
            reason: req.body.reason,
            requester: req.user,
        })
        return success(res, entry)
    } catch (err) {
        if (err instanceof ServiceError) return error(res, err.code, err.message, err.statusCode)
        console.error('Approve entry error:', err)
        return error(res, 'SERVER_ERROR', 'Could not approve entry', 500)
    }
}

const rejectEntry = async (req, res) => {
    try {
        const entry = await approvalService.reviewEntry({
            entryId: req.params.id,
            action: 'rejected',
            reason: req.body.reason,
            requester: req.user,
        })
        return success(res, entry)
    } catch (err) {
        if (err instanceof ServiceError) return error(res, err.code, err.message, err.statusCode)
        console.error('Reject entry error:', err)
        return error(res, 'SERVER_ERROR', 'Could not reject entry', 500)
    }
}

module.exports = { getPendingApprovals, approveEntry, rejectEntry }