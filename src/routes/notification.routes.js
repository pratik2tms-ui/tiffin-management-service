const router = require('express').Router()
const notificationController = require('../controllers/notification.controller')
const authenticate = require('../middleware/auth.middleware')

router.get('/', authenticate, notificationController.listNotifications)
router.patch('/seen-all', authenticate, notificationController.markAllSeen)
router.get('/unseen-count', authenticate, notificationController.unseenCount)
router.patch('/:id/seen', authenticate, notificationController.markSeen)

module.exports = router
