const express = require('express');
const router = express.Router();

const verifyToken = require('../middleware/auth');
const verifyPermission = require('../middleware/permission');
const uploadImage = require('../helper/uploadImageHelper');
const adminController = require('../controllers/adminController');

router.get('/showAuthor', verifyToken, adminController.showAuthor);
router.post(
    '/addAuthor',
    verifyToken,
    verifyPermission(['admin']),
    adminController.addAuthor,
);

router.get('/showBranch', adminController.showBranch);
router.post(
    '/addBranch',
    verifyToken,
    verifyPermission(['admin']),
    uploadImage('branchImage', process.env.BRANCH_PATH),
    adminController.addBranch,
);

router.post(
    '/addBook',
    verifyToken,
    verifyPermission(['admin']),
    uploadImage('bookImage', process.env.BOOK_PATH),
    adminController.addBook,
);
router.post(
    '/updateBook',
    verifyToken,
    verifyPermission(['admin']),
    uploadImage('bookImage', process.env.BOOK_PATH),
    adminController.updateBook,
);

router.get(
    '/showStaffandManager',
    verifyToken,
    verifyPermission(['admin']),
    adminController.showStaffandManager,
);

router.post(
    '/addDrinks',
    verifyToken,
    verifyPermission(['admin']),
    uploadImage('drinksImage', process.env.DRINKS_PATH),
    adminController.addDrinks,
);

module.exports = router;
