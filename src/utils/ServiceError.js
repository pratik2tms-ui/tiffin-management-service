class ServiceError extends Error {
    constructor(code, message, statusCode = 400) {
        super(message)
        this.code = code
        this.statusCode = statusCode
    }
}

module.exports = ServiceError