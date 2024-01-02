const express = require('express');
const router = express.Router();

const verifyToken = require('../middleware/auth');
// const verifyPermission = require('../middleware/permission')
const staffController = require('../controllers/staffController');

router.get('/showDrinks', staffController.showDrinks);
router.get('/getDrinksImage/:drinksId', staffController.getDrinksImage);
router.post('/addBill', verifyToken, staffController.addDrinksBill);
router.get('/showReservation', verifyToken, staffController.showReservation);
router.post(
    '/confirmReservation',
    verifyToken,
    staffController.confirmReservation,
);
router.post('/borrowBookAtBranch', verifyToken, staffController.borrowBookAtBranch);
router.get('/showBorrowBookAtBranch', verifyToken, staffController.showBorrowBookAtBranch);
router.post('/returnBookAtBranch', verifyToken, staffController.returnBookAtBranch);
router.post('/borrowBookToGo', verifyToken, staffController.borrowBookToGo);
router.get('/showBorrowBookToGo', verifyToken, staffController.showBorrowBookToGo);
router.post('/returnBookToGo', verifyToken, staffController.returnBookToGo);
module.exports = router;
