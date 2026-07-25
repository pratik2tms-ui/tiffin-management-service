const deviceService = require('../services/device.service')
const { success, error } = require('../utils/response')
const ServiceError = require('../utils/ServiceError')

const registerDevice = async (req, res) => {
    try {
        const device = await deviceService.registerDevice({
            userId: req.user.id,
            ...req.body
        })
        return success(res, device, 'Device registered successfully', 201)
    } catch (err) {
        if (err instanceof ServiceError) {
            return error(res, err.code, err.message, err.statusCode)
        }
        console.error('Register device error:', err)
        return error(res, 'SERVER_ERROR', 'Could not register device', 500)
    }
}

const logoutDevice = async (req, res) => {
    try {
        await deviceService.logoutDevice({
            userId: req.user.id,
            deviceId: req.body.deviceId
        })
        return success(res, null, 'Device logged out successfully', 200)
    } catch (err) {
        if (err instanceof ServiceError) {
            return error(res, err.code, err.message, err.statusCode)
        }
        console.error('Logout device error:', err)
        return error(res, 'SERVER_ERROR', 'Could not logout device', 500)
    }
}

module.exports = {
    registerDevice,
    logoutDevice
}
