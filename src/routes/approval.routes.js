const router = require('express').Router()
const { getPendingApprovals, approveEntry, rejectEntry } = require('../controllers/approval.controller')
const authenticate = require('../middleware/auth.middleware')
const authorize = require('../middleware/role.middleware')

router.get('/pending', authenticate, authorize('center', 'admin'), getPendingApprovals)
router.patch('/:id/approve', authenticate, authorize('center'), approveEntry)
router.patch('/:id/reject', authenticate, authorize('center'), rejectEntry)

module.exports = router