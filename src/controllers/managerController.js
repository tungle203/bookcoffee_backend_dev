const { connection: db } = require('../config/db');

class managerController {
    showStaff(req, res) {
        const sql =
            ' \
            SELECT u.userId as staffId, u.userName as staffName, u.disable, u.email, u.phoneNumber, u.address, w.workingDate FROM USER as u \
            JOIN WORK_ON as w \
            on u.userId = w.staffId \
            WHERE w.branchId = ? AND u.role = "staff"';

        let values = [];
        if (req.role === 'manager') values = [req.branchId];
        if (req.role === 'admin') values = [req.query.branchId];

        db.query(sql, values, (err, results) => {
            if (err) return res.sendStatus(500);
            res.json(results);
        });
    }

    addStaff(req, res) {
        const sql =
            'INSERT INTO user(userName, password, email, address, role)\
        VALUE (?,?,?,?,?)';
        const values = [
            req.body.staffName,
            req.body.password,
            req.body.email,
            req.body.address,
            'staff',
        ];

        db.query(sql, values, (err, results) => {
            if (err && err.code === 'ER_DUP_ENTRY')
                return res
                    .status(409)
                    .send({ message: 'username already exists' });
            if (err) {
                return res.sendStatus(500);
            }
            let values = [];

            if (req.role === 'manager')
                values = [results.insertId, req.branchId];

            if (req.role === 'admin')
                values = [results.insertId, req.body.branchId];

            const sql1 = 'INSERT INTO work_on(staffId, branchId) VALUES(?,?)';
            db.query(sql1, values, (err) => {
                if (err) {
                    return res.sendStatus(500);
                }
                res.sendStatus(201);
            });
        });
    }
    updateStaff(req, res) {
        const staffId = req.body.staffId;
        if (!staffId) return res.sendStatus(400);

        const sql1 =
            'SELECT branchId FROM WORK_ON as W \
            JOIN user as u \
            ON w.staffId = u.userId \
            WHERE staffId = ? and u.role = "staff"';
        db.query(sql1, [staffId], (err, staff) => {
            if (err) return res.sendStatus(500);
            if (!staff[0]) return res.sendStatus(400);

            if (req.role === 'manager' && staff[0].branchId !== req.branchId)
                return res.sendStatus(400);
            const sql2 = 'UPDATE USER SET disable = !disable WHERE userId = ?;';
            db.query(sql2, [staffId], (err) => {
                if (err) return res.sendStatus(500);
                res.sendStatus(200);
            });
        });
    }

    addBookCopies(req, res) {
        const sql1 = 'SELECT bookId FROM BOOK WHERE title = ?';
        db.query(sql1, [req.body.title], (err, results) => {
            if (err) return res.sendStatus(500);
            if (!results[0]) return res.sendStatus(400);
            const bookId = results[0].bookId;
            let sql =
                'BEGIN; \
            INSERT INTO book_copy(branchId, bookId) VALUES';
            let values = [];
            let branchId = -1;
            if (req.role === 'manager') branchId = req.branchId;
            if (req.role === 'admin') branchId = req.body.branchId;

            for (let i = 0; i < req.body.numCopies; i++) {
                sql += '(?,?),';
                values.push(branchId);
                values.push(bookId);
            }
            sql = sql.slice(0, -1);
            sql += '; COMMIT;';
            db.query(sql, values, (err) => {
                if (err) return res.sendStatus(500);
                res.sendStatus(201);
            });
        });
    }
}

module.exports = new managerController();
