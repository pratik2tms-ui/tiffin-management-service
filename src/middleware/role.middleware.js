const { error } = require('../utils/response')

const authorize = (...allowedRoles) => (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
        return error(res, 'FORBIDDEN', 'You do not have permission to access this resource', 403)
    }
    next()
}

module.exports = authorize