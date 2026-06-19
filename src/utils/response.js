const success = (res, data, message = null, statusCode = 200, pagination = null) => {
    const body = { success: true, data }
    if (message) body.message = message
    if (pagination) body.pagination = pagination
    return res.status(statusCode).json(body)
}

const error = (res, code, message, statusCode = 400) => {
    return res.status(statusCode).json({
        success: false,
        error: { code, message },
    })
}

module.exports = { success, error }