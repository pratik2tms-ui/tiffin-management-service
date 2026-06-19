const router = require('express').Router()

router.use('/auth', require('./auth.routes'))
router.use('/tiffin-entries', require('./tiffinEntry.routes'))
router.use('/approvals', require('./approval.routes'))
router.use('/reports', require('./report.routes'))

module.exports = router