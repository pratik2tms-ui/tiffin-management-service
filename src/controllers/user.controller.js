const userService = require('../services/user.service')
const ServiceError = require('../utils/ServiceError')
const { success, error } = require('../utils/response')

const getUsers = async (req, res) => {
    try {
        const data = await userService.listUsers(req.query)
        return success(res, data)
    } catch (err) {
        if (err instanceof ServiceError) return error(res, err.code, err.message, err.statusCode)
        console.error('Get users error:', err)
        return error(res, 'SERVER_ERROR', 'Could not fetch users', 500)
    }
}

const getUser = async (req, res) => {
    try {
        const data = await userService.getUserById(req.params.id)
        return success(res, data)
    } catch (err) {
        if (err instanceof ServiceError) return error(res, err.code, err.message, err.statusCode)
        console.error('Get user error:', err)
        return error(res, 'SERVER_ERROR', 'Could not fetch user', 500)
    }
}

const getUserStats = async (req, res) => {
    try {
        const data = await userService.getUserStats({
            userId: req.params.id,
            month: req.query.month,
            year: req.query.year,
        })
        return success(res, data)
    } catch (err) {
        if (err instanceof ServiceError) return error(res, err.code, err.message, err.statusCode)
        console.error('Get user stats error:', err)
        return error(res, 'SERVER_ERROR', 'Could not fetch user stats', 500)
    }
}

const createUser = async (req, res) => {
    try {
        const data = await userService.createUser({ ...req.body, requester: req.user })
        return success(res, data, null, 201)
    } catch (err) {
        if (err instanceof ServiceError) return error(res, err.code, err.message, err.statusCode)
        console.error('Create user error:', err)
        return error(res, 'SERVER_ERROR', 'Could not create user', 500)
    }
}

const updateUser = async (req, res) => {
    try {
        const data = await userService.updateUser({ id: req.params.id, ...req.body, requester: req.user })
        return success(res, data)
    } catch (err) {
        if (err instanceof ServiceError) return error(res, err.code, err.message, err.statusCode)
        console.error('Update user error:', err)
        return error(res, 'SERVER_ERROR', 'Could not update user', 500)
    }
}

const deleteUser = async (req, res) => {
    try {
        await userService.deleteUser({ id: req.params.id, requester: req.user })
        return success(res, null, 'Customer deleted')
    } catch (err) {
        if (err instanceof ServiceError) return error(res, err.code, err.message, err.statusCode)
        console.error('Delete user error:', err)
        return error(res, 'SERVER_ERROR', 'Could not delete user', 500)
    }
}

module.exports = { getUsers, getUser, getUserStats, createUser, updateUser, deleteUser }