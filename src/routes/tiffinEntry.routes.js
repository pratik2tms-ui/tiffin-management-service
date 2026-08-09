const router = require('express').Router()
const { addTiffin, markNoTiffin, getTiffinEntries, getTiffinEntryById, updateTiffin } = require('../controllers/tiffinEntry.controller')
const authenticate = require('../middleware/auth.middleware')
const authorize = require('../middleware/role.middleware')

router.get('/', authenticate, getTiffinEntries)
router.get('/:id', authenticate, authorize('center', 'user', 'admin'), getTiffinEntryById)
router.post('/', authenticate, authorize('center', 'user'), addTiffin)
router.put('/:id', authenticate, authorize('center', 'user'), updateTiffin)
router.post('/no-tiffin', authenticate, authorize('user'), markNoTiffin)

module.exports = router