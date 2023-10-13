const express = require('express');
const router = express.Router();

const verifyToken = require('../middleware/auth');
const verifyPermission = require('../middleware/permission')
const staffController = require('../controllers/staffController');

router.get('/show', verifyToken, verifyPermission(['staff']), staffController.show);

module.exports = router;
