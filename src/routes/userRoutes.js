const express = require('express');

const { asyncHandler } = require('../middleware/asyncHandler');
const { authenticateAccessToken } = require('../middleware/authMiddleware');
const { meHandler } = require('../controllers/userController');

const router = express.Router();

router.get('/me', authenticateAccessToken, asyncHandler(meHandler));

module.exports = { userRoutes: router };
