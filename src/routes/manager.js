const express = require('express');
const router = express.Router();

const verifyToken = require('../middleware/auth');
const verifyPermission = require('../middleware/permission')
const managerController = require('../controllers/managerController');

router.get('/showStaff', verifyToken, verifyPermission(['admin', 'manager']), managerController.showStaff);
router.post('/addStaff', verifyToken, verifyPermission(['admin', 'manager']), managerController.addStaff);
router.put('/updateStaff', verifyToken, verifyPermission(['admin', 'manager']), managerController.updateStaff);
router.post('/addBookCopy', verifyToken, verifyPermission(['admin', 'manager']), managerController.addBookCopies);
module.exports = router;
