const express = require('express');
const router = express.Router();

const verifyToken = require('../middleware/auth');
// const verifyPermission = require('../middleware/permission')
const uploadImage = require('../helper/uploadImageHelper');
const customerController = require('../controllers/customerController');

router.get('/getAvatar', verifyToken, customerController.getAvatar);
router.post(
    '/uploadAvatar',
    verifyToken,
    uploadImage('avatar', process.env.AVATAR_PATH),
    customerController.uploadAvatar,
);
router.get('/getProfile', verifyToken, customerController.getProfile);
router.post('/updateProfile', verifyToken, customerController.updateProfile);
router.post('/changePassword', verifyToken, customerController.changePassword);
router.get('/getBookImage/:bookId', customerController.getBookImage);
router.get('/getBranchImage/:branchId', customerController.getBranchImage);
router.get('/search', customerController.searchBook);
router.get('/branchInfo', customerController.getBranchInfo);
router.post('/reservation', verifyToken, customerController.createReservation);
router.get('/showReservation', verifyToken, customerController.showReservation);
router.post('/meeting', verifyToken, customerController.createMeeting);
router.get(
    '/showBookBorrowing',
    verifyToken,
    customerController.showBookBorrowing,
);

module.exports = router;
