const express = require('express');
const router = express.Router();

const verifyToken = require('../middleware/auth');
// const verifyPermission = require('../middleware/permission')
const managerController = require('../controllers/managerController');

router.get('/showStaff', managerController.showStaff);
router.get('/showCustomer', managerController.showCustomer);
router.post('/addStaff', managerController.addStaff);
router.delete('/deleteStaff', managerController.deleteStaff);

module.exports = router;
