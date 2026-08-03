const router = require('express').Router()

router.use('/auth', require('./auth.routes'))
router.use('/tiffin-entries', require('./tiffinEntry.routes'))
router.use('/approvals', require('./approval.routes'))
router.use('/reports', require('./report.routes'))
router.use('/pricing', require('./pricing.routes'))
router.use('/payments', require('./payment.routes'))
router.use('/users', require('./user.routes'))
router.use('/tiffin-centers', require('./tiffinCenter.routes'))
router.use('/devices', require('./device.routes'))
router.use('/notifications', require('./notification.routes'))
router.use('/mini-api', require('./miniApi.routes'))

module.exports = router