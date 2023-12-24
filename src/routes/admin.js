const express = require('express');
const router = express.Router();

const verifyToken = require('../middleware/auth');
// const verifyPermission = require('../middleware/permission')
const adminController = require('../controllers/adminController');


router.get('/showAuthor', adminController.showAuthor);
router.post('/addAuthor', adminController.addAuthor);
router.post('/changeAuthorinfo', adminController.changeAuthorinfo);
router.post('/deleteAuthorinfo', adminController.deleteAuthorinfo);

router.get('/showBranch', adminController.showBranch);
router.post('/addBranch', adminController.addBranch);
router.post('/changeBranchinfo', adminController.changeBranchinfo);
// router.post('/deleteBranchinfo', adminController.deleteBranchinfo);

router.get('/showBook', adminController.showBook);
router.post('/addBook', adminController.addBook);
router.post('/changeBookinfo', adminController.changeBookinfo);
router.post('/deleteBookinfo', adminController.deleteBookinfo);
router.post('/addBookCopies', adminController.addBookCopies);

router.get('/showStaffandManager', adminController.showStaffandManager);
router.post('/deleteStafffromBranch', adminController.deleteStafffromBranch);
router.post('/addStaff2Branch', adminController.addStaff2Branch);

// router.post('/addDrinks', adminController.addDrinks);

module.exports = router;
