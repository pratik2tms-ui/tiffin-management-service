const router = require('express').Router()
const { getPayment, getPaymentsByCenter, recordPayment, getTransactions } = require('../controllers/payment.controller')
const authenticate = require('../middleware/auth.middleware')
const authorize = require('../middleware/role.middleware')

router.get('/', authenticate, getPayment)
router.get('/center/:centerId', authenticate, authorize('admin', 'center'), getPaymentsByCenter)
router.post('/', authenticate, authorize('center'), recordPayment)
router.get('/:id/transactions', authenticate, getTransactions)

module.exports = router