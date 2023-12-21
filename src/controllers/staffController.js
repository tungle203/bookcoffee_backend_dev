const db = require('../config/db');

class StaffController {
    show(req, res, next) {
        const sql = 'SELECT * FROM USER';
        db.query(sql, (err, results) => {
            if (err) next(err);
            res.json(results);
        });
    }

    showReservation(req, res) {
        const sql = 'SELECT r.reservationId, u.userName, b.address, r.reservationDate, r.quantity FROM RESERVATIONS AS r\
        JOIN USER AS u\
        ON r.userId = u.userId\
        JOIN BRANCH AS b\
        ON r.branchId = b.branchId'
        db.query(sql, (err, results) => {
            if (err) {
                return res.sendStatus(500);
            }
            res.json(results);
        });
    }
    confirmReservation(req, res) {
        const reservationId = req.body.reservationId;
        if (!reservationId) return res.sendStatus(400);

        const sql =
            'UPDATE RESERVATIONS SET staffId = ?, isConfirm = TRUE WHERE reservationId = ?';
        const values = [req.userId, reservationId];

        db.query(sql, values, (err) => {
            if (err) {
                return res.sendStatus(500);
            }
            return res.sendStatus(200);
        });
    }

    createBookBorrowing(req, res) {
        const userName = req.body.userName;
        const copyId = req.body.copyId;
        if (!userName || !copyId) return res.sendStatus(400);

        const sql1 = 'SELECT userId FROM USER WHERE userName = ?';
        db.query(sql1, [userName], (err, results) => {
            if (!results[0].userId) return res.sendStatus(400);

            const sql2 =
                'BEGIN;\
                INSERT INTO BOOKBORROWINGS(userId, copyId, staffId) VALUE (?,?,?); \
                UPDATE BOOKCOPY SET isBorrowed = TRUE WHERE copyId = ?;\
                COMMIT';
            const values = [results[0].userId, copyId, req.userId, copyId];

            db.query(sql2, values, (err) => {
                if (err) return res.sendStatus(500);
                res.sendStatus(201);
            });
        });
    }
}

module.exports = new StaffController();
