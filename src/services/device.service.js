const { DeviceToken } = require('../models')
const ServiceError = require('../utils/ServiceError')

const registerDevice = async ({ userId, deviceId, fcmToken, platform }) => {
    if (!userId || !deviceId || !fcmToken) {
        throw new ServiceError('VALIDATION_ERROR', 'userId, deviceId, and fcmToken are required', 400)
    }

    let deviceToken = await DeviceToken.findOne({ where: { deviceId } })

    if (deviceToken) {
        deviceToken.userId = userId
        deviceToken.fcmToken = fcmToken
        deviceToken.platform = platform || 'web'
        deviceToken.isActive = true
        deviceToken.lastActiveAt = new Date()
        await deviceToken.save()
    } else {
        deviceToken = await DeviceToken.create({
            userId,
            deviceId,
            fcmToken,
            platform: platform || 'web',
            isActive: true,
            lastActiveAt: new Date(),
        })
    }

    return deviceToken
}

const logoutDevice = async ({ userId, deviceId }) => {
    if (!userId || !deviceId) {
        throw new ServiceError('VALIDATION_ERROR', 'userId and deviceId are required', 400)
    }

    const deviceToken = await DeviceToken.findOne({ where: { deviceId, userId } })
    if (deviceToken) {
        deviceToken.isActive = false
        await deviceToken.save()
    }

    return { success: true }
}

module.exports = {
    registerDevice,
    logoutDevice
}
