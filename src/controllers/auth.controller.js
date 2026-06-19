const authService = require('../services/auth.service')
const ServiceError = require('../utils/ServiceError')
const { success, error } = require('../utils/response')

const login = async (req, res) => {
    try {
        const result = await authService.loginUser(req.body)
        return success(res, result)
    } catch (err) {
        if (err instanceof ServiceError) return error(res, err.code, err.message, err.statusCode)
        console.error('Login error:', err)
        return error(res, 'SERVER_ERROR', 'Something went wrong during login', 500)
    }
}

const me = async (req, res) => {
    try {
        const user = await authService.getCurrentUser(req.user.id)
        return success(res, user)
    } catch (err) {
        if (err instanceof ServiceError) return error(res, err.code, err.message, err.statusCode)
        console.error('Me error:', err)
        return error(res, 'SERVER_ERROR', 'Could not fetch user', 500)
    }
}

const logout = async (req, res) => {
    return success(res, null, 'Logged out successfully')
}

module.exports = { login, me, logout }