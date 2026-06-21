const router = require('express').Router()
const { getDashboard, getBillingReport } = require('../controllers/report.controller')
const authenticate = require('../middleware/auth.middleware')
const authorize = require('../middleware/role.middleware')

router.get('/dashboard', authenticate, getDashboard)
router.get('/billing', authenticate, authorize('admin', 'center'), getBillingReport)

module.exports = router