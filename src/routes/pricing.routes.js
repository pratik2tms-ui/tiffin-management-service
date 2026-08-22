const router = require('express').Router()
const { getPricing, putPricing, listPricing, createPricing, updatePricingById, deletePricing, getPricingById } = require('../controllers/pricing.controller')
const authenticate = require('../middleware/auth.middleware')
const authorize = require('../middleware/role.middleware')

// Custom/legacy pricing structure
router.get('/active', authenticate, getPricing)
router.put('/bulk', authenticate, authorize('admin', 'center'), putPricing)

// Generic config endpoints for AppTable/AppForm
router.get('/', authenticate, listPricing)
router.post('/', authenticate, authorize('admin', 'center'), createPricing)
router.get('/:id', authenticate, authorize('admin', 'center'), getPricingById)
router.put('/:id', authenticate, authorize('admin', 'center'), updatePricingById)
router.delete('/:id', authenticate, authorize('admin', 'center'), deletePricing)

module.exports = router