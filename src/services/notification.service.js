const { Notification, DeviceToken } = require('../models')
const { messaging, isInitialized } = require('../config/firebase')

const sendNotification = async ({ userId, type, title, body, data = {}, entryId = null, centerId = null }) => {
    // 1. Get all active device tokens for the recipient
    const devices = await DeviceToken.findAll({
        where: { userId, isActive: true }
    })

    let status = 'sent'
    let errorMessage = null

    if (devices.length === 0) {
        status = 'skipped'
    } else {
        if (!isInitialized) {
            status = 'failed'
            errorMessage = 'Firebase Admin SDK is not initialized.'
            console.warn('⚠️ Cannot send push notification because Firebase is not configured.')
        } else {
            try {
                const tokens = devices.map(d => d.fcmToken)

                // FCM data values must be strings
                const stringifiedData = Object.fromEntries(
                    Object.entries(data).map(([k, v]) => [k, String(v)])
                )

                await messaging.sendEachForMulticast({
                    tokens,
                    notification: { title, body },
                    data: stringifiedData,
                })
            } catch (err) {
                console.error('Push notification failed:', err)
                status = 'failed'
                errorMessage = err.message
            }
        }
    }

    // 2. Always log
    await Notification.create({
        userId,
        entryId,
        centerId,
        type,
        title,
        body,
        data,
        status,
        errorMessage,
    })
}

const listNotifications = async ({ userId, page = 1, limit = 20 }) => {
    const offset = (page - 1) * limit
    const { rows, count } = await Notification.findAndCountAll({
        where: { userId, isSeen: false },
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset),
        attributes: ['id', 'type', 'title', 'body', 'data', 'isSeen', 'seenAt', 'createdAt']
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

const markSeen = async ({ userId, notificationId }) => {
    const notification = await Notification.findOne({
        where: { id: notificationId, userId, isSeen: false }
    })

    if (notification) {
        notification.isSeen = true
        notification.seenAt = new Date()
        await notification.save()
    }
    return { success: true }
}

const markAllSeen = async ({ userId }) => {
    await Notification.update(
        { isSeen: true, seenAt: new Date() },
        { where: { userId, isSeen: false } }
    )
    return { success: true }
}

const unseenCount = async ({ userId }) => {
    const count = await Notification.count({
        where: { userId, isSeen: false }
    })
    return { count }
}

module.exports = {
    sendNotification,
    listNotifications,
    markSeen,
    markAllSeen,
    unseenCount
}
