const router = require('express').Router()
const {
    getUsers, getUser, getUserStats, createUser, updateUser, deleteUser,
} = require('../controllers/user.controller')
const authenticate = require('../middleware/auth.middleware')
const authorize = require('../middleware/role.middleware')

router.get('/', authenticate, authorize('admin', 'center'), getUsers)
router.get('/:id', authenticate, getUser)
router.get('/:id/stats', authenticate, authorize('admin', 'center'), getUserStats)
router.post('/', authenticate, authorize('admin', 'center'), createUser)
router.patch('/:id', authenticate, authorize('admin', 'center'), updateUser)
router.delete('/:id', authenticate, authorize('admin', 'center'), deleteUser)

module.exports = router