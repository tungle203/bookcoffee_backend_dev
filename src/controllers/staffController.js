const db = require('../config/db');

class StaffController {
    show(req, res, next) {
        const sql = 'SELECT * FROM user';
        db.query(sql, (err, results) => {
            if (err) next(err);
            res.json(results);
        });
    }

    showReservation(req, res) {
        const sql = 'SELECT r.reservation_id, u.user_name, b.address, r.reservation_date, r.quantity FROM reservations AS r\
        JOIN user AS u\
        ON r.user_id = u.user_id\
        JOIN branch AS b\
        ON r.branch_id = b.branch_id'
        db.query(sql, (err, results) => {
            if (err) {
                return res.sendStatus(500);
            }
            res.json(results);
        });
    }
    confirmReservation(req, res) {
        const reservationId = req.body.reservation_id;
        if (!reservationId) return res.sendStatus(400);

        const sql =
            'UPDATE reservations SET staff_id = ?, is_confirm = TRUE WHERE reservation_id = ?';
        const values = [req.userId, reservationId];

        db.query(sql, values, (err) => {
            if (err) {
                return res.sendStatus(500);
            }
            return res.sendStatus(200);
        });
    }

    createBookBorrowing(req, res) {
        const userName = req.body.user_name;
        const copyId = req.body.copy_id;
        if (!userName || !copyId) return res.sendStatus(400);

        const sql1 = 'SELECT user_id FROM user WHERE user_name = ?';
        db.query(sql1, [userName], (err, results) => {
            if (!results[0].user_id) return res.sendStatus(400);

            const sql2 =
                'INSERT INTO bookborrowings(user_id, copy_id, staff_id) VALUE (?,?,?)';
            const values = [results[0].user_id, copyId, req.userId];

            db.query(sql2, values, (err) => {
                if (err) return res.sendStatus(500);
            });

            const sql3 = 'UPDATE book_copy SET is_borrowed = TRUE WHERE copy_id = ?'
            db.query(sql3, [copyId], err => {
                if (err) return res.sendStatus(500);
                res.sendStatus(201);
            })
        });
    }
}

module.exports = new StaffController();
