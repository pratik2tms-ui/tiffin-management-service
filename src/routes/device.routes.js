const router = require('express').Router()
const deviceController = require('../controllers/device.controller')
const authenticate = require('../middleware/auth.middleware')

router.post('/register', authenticate, deviceController.registerDevice)
router.post('/logout', authenticate, deviceController.logoutDevice)

module.exports = router
