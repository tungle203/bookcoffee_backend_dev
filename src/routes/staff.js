const express = require('express');
const router = express.Router();

const verifyToken = require('../middleware/auth');
const staffController = require('../controllers/staffController');

router.get('/show', verifyToken, staffController.show);

module.exports = router;
