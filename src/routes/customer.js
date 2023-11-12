const express = require('express');
const router = express.Router();

const verifyToken = require('../middleware/auth');
// const verifyPermission = require('../middleware/permission')
const customerController = require('../controllers/customerController');

router.get('/search', customerController.searchBook);
router.get('/branchInfo', customerController.getBranchInfo);
router.get('/bookOfBranch', customerController.getBookOfBranch);
router.post('/reservation', verifyToken, customerController.createReservation);
router.post('/meeting', verifyToken, customerController.createMeeting);
router.post('/showBookBorrowing', verifyToken, customerController.showBookBorrowing);


module.exports = router;
