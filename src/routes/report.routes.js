const router = require('express').Router()
const { getDashboard } = require('../controllers/report.controller')
const authenticate = require('../middleware/auth.middleware')

router.get('/dashboard', authenticate, getDashboard)

module.exports = router