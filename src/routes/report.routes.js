const router = require('express').Router()
const { getDashboard, getBillingReport, getCustomerHistory, getCenterTypeBreakdown } = require('../controllers/report.controller')
const authenticate = require('../middleware/auth.middleware')
const authorize = require('../middleware/role.middleware')

router.get('/dashboard', authenticate, getDashboard)
router.get('/billing', authenticate, authorize('admin', 'center'), getBillingReport)
router.get('/customer-history', authenticate, authorize('user'), getCustomerHistory)
router.get('/center-breakdown', authenticate, authorize('admin', 'center'), getCenterTypeBreakdown)

module.exports = router