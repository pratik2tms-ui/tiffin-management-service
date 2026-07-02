const bcrypt = require('bcryptjs')
const { User, TiffinCenter } = require('../models')
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

    // For center role — resolve centerId from TiffinCenter using ownerId
    let centerId = user.centerId

    if (user.role === 'center') {
        const center = await TiffinCenter.findOne({
            where: { owner_id: user.id, is_deleted: false },
            attributes: ['id'],
            raw: true,
        })

        if (!center) {
            throw new ServiceError('NOT_FOUND', 'No tiffin center found for this account', 404)
        }

        centerId = center.id
    }

    const token = generateToken({
        id: user.id,
        uuid: user.uuid,
        username: user.username,
        role: user.role,
        centerId,
    })

    return {
        token,
        user: {
            id: user.id,
            uuid: user.uuid,
            name: user.name,
            username: user.username,
            role: user.role,
            centerId,
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