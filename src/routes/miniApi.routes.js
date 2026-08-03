const express = require('express');
const router = express.Router();
const miniApiController = require('../controllers/miniApi.controller');
const authenticate = require('../middleware/auth.middleware');

// Dropdown endpoints
router.get('/tiffin-centers', miniApiController.getTiffinCentersDropdown);
router.get('/customers', authenticate, miniApiController.getCustomersDropdown);

module.exports = router;
