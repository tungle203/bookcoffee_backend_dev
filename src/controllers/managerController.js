const db = require('../config/db');
const { handleErrorDB } = require('../helper/handleErrorHelper');
class managerController {
    showStaff(req, res) {
        const sql =
            ' \
            SELECT u.userId as "staffId", u.userName as "staffName", u.disable, u.email, u.phoneNumber as "phoneNumber", u.address, w.workingDate as "workingDate" \
            FROM _USER as u \
            JOIN _WORK_ON as w \
            on u.userId = w.staffId \
            WHERE w.branchId = $1 AND u.role = "staff"';

        let values = [];
        if (req.role === 'manager') values = [req.branchId];
        if (req.role === 'admin') values = [req.query.branchId];

        db.query(sql, values, (err, results) => {
            if (err) return res.sendStatus(500);
            res.json(results.rows);
        });
    }

    addStaff(req, res) {
        const sql =
            'INSERT INTO _USER(userName, password, email, address, role)\
        VALUE ($1, $2, $3, $4, $5)';
        const values = [
            req.body.staffName,
            req.body.password,
            req.body.email,
            req.body.address,
            'staff',
        ];

        db.query(sql, values, (err, results) => {
            if (err) {
                return handleErrorDB(err, res);
            }
            let values = [];

            if (req.role === 'manager')
                values = [results.insertId, req.branchId];

            if (req.role === 'admin')
                values = [results.insertId, req.body.branchId];

            const sql1 = 'INSERT INTO _WORK_ON(staffId, branchId) VALUES($1, $2)';
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
            'SELECT branchId as "branchId" FROM _WORK_ON as w \
            JOIN _USER as u \
            ON w.staffId = u.userId \
            WHERE staffId = $1 and u.role = "staff"';
        db.query(sql1, [staffId], (err, staff) => {
            if (err) return res.sendStatus(500);
            if (!staff[0]) return res.sendStatus(400);

            if (req.role === 'manager' && staff[0].branchId !== req.branchId)
                return res.sendStatus(400);
            const sql2 = 'UPDATE _USER SET disable = !disable WHERE userId = $1';
            db.query(sql2, [staffId], (err) => {
                if (err) return res.sendStatus(500);
                res.sendStatus(200);
            });
        });
    }

    addBookCopies(req, res) {
        const sql1 = 'SELECT bookId as "bookId" FROM _BOOK WHERE title = $1';
        db.query(sql1, [req.body.title], (err, results) => {
            if (err) return res.sendStatus(500);
            if (!results[0]) return res.sendStatus(400);
            const bookId = results[0].bookId;
            let sql =
                'BEGIN; \
            INSERT INTO _BOOK_COPY(branchId, bookId) VALUES';
            let values = [];
            let branchId = -1;
            let position = 1;
            if (req.role === 'manager') branchId = req.branchId;
            if (req.role === 'admin') branchId = req.body.branchId;

            for (let i = 1; i <= req.body.numCopies; i++) {
                sql += `($${position++}, $${position++}),`;
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
