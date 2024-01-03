const express = require('express');
const router = express.Router();

const verifyToken = require('../middleware/auth');
// const verifyPermission = require('../middleware/permission')
const adminController = require('../controllers/adminController');


router.get('/showAuthor', verifyToken, adminController.showAuthor);
router.post('/addAuthor', verifyToken, adminController.addAuthor);

router.get('/showBranch', verifyToken, adminController.showBranch);
router.post('/addBranch', verifyToken, adminController.addBranch);

router.post('/addBook', verifyToken, adminController.addBook);

router.get('/showStaffandManager', verifyToken, adminController.showStaffandManager);

router.post('/addDrinks', verifyToken, adminController.addDrinks);

module.exports = router;
