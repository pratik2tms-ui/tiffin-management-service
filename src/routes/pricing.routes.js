const router = require('express').Router()
const { getPricing, putPricing } = require('../controllers/pricing.controller')
const authenticate = require('../middleware/auth.middleware')
const authorize = require('../middleware/role.middleware')

router.get('/', authenticate, authorize('admin', 'center'), getPricing)
router.put('/', authenticate, authorize('admin', 'center'), putPricing)

module.exports = router