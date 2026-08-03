const router = require('express').Router()
const { addTiffin, markNoTiffin, getTiffinEntries, updateTiffin } = require('../controllers/tiffinEntry.controller')
const authenticate = require('../middleware/auth.middleware')
const authorize = require('../middleware/role.middleware')

router.get('/', authenticate, getTiffinEntries)
router.post('/', authenticate, authorize('center', 'user'), addTiffin)
router.put('/:id', authenticate, authorize('center', 'admin'), updateTiffin)
router.post('/no-tiffin', authenticate, authorize('user'), markNoTiffin)

module.exports = router