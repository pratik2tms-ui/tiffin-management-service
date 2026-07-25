const notificationService = require('../services/notification.service')
const { success, error } = require('../utils/response')
const ServiceError = require('../utils/ServiceError')

const listNotifications = async (req, res) => {
    try {
        const result = await notificationService.listNotifications({
            userId: req.user.id,
            page: req.query.page,
            limit: req.query.limit
        })
        return success(res, result.data, null, 200, result.pagination)
    } catch (err) {
        if (err instanceof ServiceError) {
            return error(res, err.code, err.message, err.statusCode)
        }
        console.error('List notifications error:', err)
        return error(res, 'SERVER_ERROR', 'Could not fetch notifications', 500)
    }
}

const markSeen = async (req, res) => {
    try {
        await notificationService.markSeen({
            userId: req.user.id,
            notificationId: req.params.id
        })
        return success(res, null, 'Notification marked as seen', 200)
    } catch (err) {
        if (err instanceof ServiceError) {
            return error(res, err.code, err.message, err.statusCode)
        }
        console.error('Mark seen error:', err)
        return error(res, 'SERVER_ERROR', 'Could not mark notification as seen', 500)
    }
}

const markAllSeen = async (req, res) => {
    try {
        await notificationService.markAllSeen({
            userId: req.user.id
        })
        return success(res, null, 'All notifications marked as seen', 200)
    } catch (err) {
        if (err instanceof ServiceError) {
            return error(res, err.code, err.message, err.statusCode)
        }
        console.error('Mark all seen error:', err)
        return error(res, 'SERVER_ERROR', 'Could not mark all notifications as seen', 500)
    }
}

const unseenCount = async (req, res) => {
    try {
        const result = await notificationService.unseenCount({
            userId: req.user.id
        })
        return success(res, result, null, 200)
    } catch (err) {
        if (err instanceof ServiceError) {
            return error(res, err.code, err.message, err.statusCode)
        }
        console.error('Unseen count error:', err)
        return error(res, 'SERVER_ERROR', 'Could not fetch unseen count', 500)
    }
}

module.exports = {
    listNotifications,
    markSeen,
    markAllSeen,
    unseenCount
}
