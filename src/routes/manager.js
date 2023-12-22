const express = require('express');
const router = express.Router();

const verifyToken = require('../middleware/auth');
// const verifyPermission = require('../middleware/permission')
const managerController = require('../controllers/managerController');

router.get('/showStaff', managerController.showStaff);
router.post('/addStaff', verifyToken, managerController.addStaff);

module.exports = router;