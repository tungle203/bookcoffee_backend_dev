const express = require('express');
const router = express.Router();

const verifyToken = require('../middleware/auth');
// const verifyPermission = require('../middleware/permission')
const customerController = require('../controllers/customerController');

router.get('/getAvatar', verifyToken, customerController.getAvatar);
router.get('/search', customerController.searchBook);
router.get('/branchInfo', customerController.getBranchInfo);
router.post('/reservation', verifyToken, customerController.createReservation);
router.post('/meeting', verifyToken, customerController.createMeeting);
router.get(
    '/showBookBorrowing',
    verifyToken,
    customerController.showBookBorrowing,
);

module.exports = router;
