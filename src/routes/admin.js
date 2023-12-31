const express = require('express');
const router = express.Router();

const verifyToken = require('../middleware/auth');
// const verifyPermission = require('../middleware/permission')
const adminController = require('../controllers/adminController');


router.get('/showAuthor', verifyToken, adminController.showAuthor);
router.post('/addAuthor', verifyToken, adminController.addAuthor);
router.post('/changeAuthorinfo', verifyToken, adminController.changeAuthorinfo);
router.post('/deleteAuthorinfo', verifyToken, adminController.deleteAuthorinfo);

router.get('/showBranch', verifyToken, adminController.showBranch);
router.post('/addBranch', verifyToken, adminController.addBranch);
router.post('/changeBranchinfo', verifyToken, adminController.changeBranchinfo);
// router.post('/deleteBranchinfo', verifyToken, adminController.deleteBranchinfo);

router.get('/showBook', verifyToken, adminController.showBook);
router.post('/addBook', verifyToken, adminController.addBook);
router.post('/changeBookinfo', verifyToken, adminController.changeBookinfo);
router.post('/deleteBookinfo', verifyToken, adminController.deleteBookinfo);
router.post('/addBookCopies', verifyToken, adminController.addBookCopies);

router.get('/showStaffandManager', verifyToken, adminController.showStaffandManager);

router.get('/branch/:branchId/showStaff', verifyToken, adminController.showStaff);
router.post('/branch/:branchId/deleteStaff', verifyToken, adminController.deleteStaff);
router.post('/branch/:branchId/addStaff', verifyToken, adminController.addStaff);


router.post('/addDrinks', verifyToken, adminController.addDrinks);

module.exports = router;
