const express = require('express');
const router = express.Router();

const verifyToken = require('../middleware/auth');
const verifyPermission = require('../middleware/permission');
const verifyCache = require('../middleware/cache');
const staffController = require('../controllers/staffController');

router.get('/showDrinks', verifyCache('drinks'), staffController.showDrinks);
router.get('/getDrinksImage/:drinksId', staffController.getDrinksImage);
router.post(
    '/addBill',
    verifyToken,
    verifyPermission(['admin', 'manager', 'staff']),
    staffController.addDrinksBill,
);
router.get('/showReservation', verifyToken, staffController.showReservation);
router.post(
    '/confirmReservation',
    verifyToken,
    verifyPermission(['admin', 'manager', 'staff']),
    staffController.confirmReservation,
);
router.post(
    '/borrowBookAtBranch',
    verifyToken,
    verifyPermission(['admin', 'manager', 'staff']),
    staffController.borrowBookAtBranch,
);
router.get(
    '/showBorrowBookAtBranch',
    verifyToken,
    verifyPermission(['admin', 'manager', 'staff']),
    staffController.showBorrowBookAtBranch,
);
router.post(
    '/returnBookAtBranch',
    verifyToken,
    verifyPermission(['admin', 'manager', 'staff']),
    staffController.returnBookAtBranch,
);
router.post(
    '/borrowBookToGo',
    verifyToken,
    verifyPermission(['admin', 'manager', 'staff']),
    staffController.borrowBookToGo,
);
router.get(
    '/showBorrowBookToGo',
    verifyToken,
    verifyPermission(['admin', 'manager', 'staff']),
    staffController.showBorrowBookToGo,
);
router.post(
    '/returnBookToGo',
    verifyToken,
    verifyPermission(['admin', 'manager', 'staff']),
    staffController.returnBookToGo,
);
module.exports = router;
