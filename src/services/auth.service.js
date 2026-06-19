const bcrypt = require('bcryptjs')
const { User } = require('../models')
const { generateToken } = require('../utils/jwt')
const ServiceError = require('../utils/ServiceError')

const loginUser = async ({ username, password }) => {
    if (!username || !password) {
        throw new ServiceError('VALIDATION_ERROR', 'Username and password are required', 400)
    }

    const user = await User.findOne({ where: { username, isDeleted: false } })
    if (!user) {
        throw new ServiceError('INVALID_CREDENTIALS', 'Invalid username or password', 401)
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash)
    if (!isMatch) {
        throw new ServiceError('INVALID_CREDENTIALS', 'Invalid username or password', 401)
    }

    if (!user.isActive) {
        throw new ServiceError('ACCOUNT_INACTIVE', 'This account has been deactivated', 403)
    }

    const token = generateToken({
        id: user.id,
        uuid: user.uuid,
        username: user.username,
        role: user.role,
        centerId: user.centerId,
    })

    return {
        token,
        user: {
            id: user.id,
            uuid: user.uuid,
            name: user.name,
            username: user.username,
            role: user.role,
            centerId: user.centerId,
            avatar: user.avatar,
        },
    }
}

const getCurrentUser = async (userId) => {
    const user = await User.findByPk(userId, {
        attributes: ['id', 'uuid', 'name', 'username', 'role', 'centerId', 'avatar', 'phone'],
    })
    if (!user) {
        throw new ServiceError('NOT_FOUND', 'User not found', 404)
    }
    return user
}

module.exports = { loginUser, getCurrentUser }