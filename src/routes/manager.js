const express = require('express');
const router = express.Router();

const verifyToken = require('../middleware/auth');
// const verifyPermission = require('../middleware/permission')
const managerController = require('../controllers/managerController');

router.get('/showStaff', verifyToken, managerController.showStaff);
router.post('/addStaff', verifyToken, managerController.addStaff);
router.delete('/deleteStaff', verifyToken, managerController.deleteStaff);
router.post('/addBookCopy', verifyToken, managerController.addBookCopies);
module.exports = router;
