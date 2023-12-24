const express = require('express');
const router = express.Router();

const verifyToken = require('../middleware/auth');

const managerController = require('../controllers/managerController');

router.get('/showStaff',verifyToken, managerController.showStaff);
router.get('/showCustomer', managerController.showCustomer);
router.post('/addStaff',verifyToken, managerController.addStaff);
router.delete('/deleteStaff', managerController.deleteStaff);


router.post('/addBook', managerController.addBook);
router.post('/changeBookinfo', managerController.changeBookinfo);
router.post('/addBookCopies',verifyToken, managerController.addBookCopies);

module.exports = router;
