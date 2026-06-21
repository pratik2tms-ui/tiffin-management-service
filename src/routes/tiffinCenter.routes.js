const router = require('express').Router()
const {
    getCenters, getCenter, getCenterCustomers, createCenter, updateCenter,
} = require('../controllers/tiffinCenter.controller')
const authenticate = require('../middleware/auth.middleware')
const authorize = require('../middleware/role.middleware')

router.get('/', authenticate, authorize('admin'), getCenters)
router.get('/:id', authenticate, getCenter)
router.get('/:id/customers', authenticate, authorize('admin', 'center'), getCenterCustomers)
router.post('/', authenticate, authorize('admin'), createCenter)
router.patch('/:id', authenticate, authorize('admin'), updateCenter)

module.exports = router