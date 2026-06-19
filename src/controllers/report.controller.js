const reportService = require('../services/report.service')
const { success, error } = require('../utils/response')

const getDashboard = async (req, res) => {
    try {
        const data = await reportService.getDashboard({
            requester: req.user,
            month: req.query.month,
        })
        return success(res, data)
    } catch (err) {
        console.error('Dashboard error:', err)
        return error(res, 'SERVER_ERROR', 'Could not load dashboard data', 500)
    }
}

module.exports = { getDashboard }