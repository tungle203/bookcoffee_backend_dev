const db = require('../config/db');

class managerController {
    showStaff(req, res) {
        const sql =
            ' \
            SELECT u.userId as staffId, u.userName as staffName, u.disable, u.email, u.address, w.workingDate FROM USER as u \
            JOIN WORK_ON as w \
            on u.userId = w.staffId \
            WHERE w.branchId = ? AND u.role = "staff"';

        db.query(sql, [req.branchId], (err, results) => {
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
            console.log(err);
            if(err && err.code === 'ER_DUP_ENTRY') return res.status(409).send({message: 'username already exists'});
            if (err) {
                return res.sendStatus(500);
            }
            const sql1 = 'INSERT INTO work_on(staffId, branchId) VALUES(?,?)'
            db.query(sql1, [results.insertId, req.branchId], (err) => {
                if (err) {
                    return res.sendStatus(500);
                }
                res.sendStatus(201);
            });  
        });
    }
    deleteStaff(req, res) {
        const staffId = req.body.staffId;
        if (!staffId) return res.sendStatus(400);

        const sql1 = 'SELECT branchId FROM WORK_ON as W \
            JOIN user as u \
            ON w.staffId = u.userId \
            WHERE staffId = ? and u.role = "staff"';
            db.query(sql1, [staffId], (err, staff) => {
                if(err) return res.sendStatus(500);
                if(!staff[0]) return res.sendStatus(400);

                if(staff[0].branchId !== req.branchId) return res.sendStatus(400);
                    const sql2 =
                    'BEGIN;\
                    UPDATE USER SET disable = TRUE WHERE userId = ?; \
                    COMMIT;';
                    const values = [
                        staffId,
                        staff[0].branchId,
                        staffId,
                    ];

                    // const sql = 'update user set role = "customer" where userId = ?';
                    db.query(sql2, values, (err) => {
                        console.log(err);
                        if (err) return res.sendStatus(500);
                        res.sendStatus(200);
                    });
                })
    }
    
    addBookCopies(req, res) {
        const sql1 = "SELECT bookId FROM BOOK WHERE title = ?"
        db.query(sql1, [req.body.title], (err, results) => {
            if(err) return res.sendStatus(500);
            if(!results[0]) return res.sendStatus(400);
            const bookId = results[0].bookId;
            let sql =
            'BEGIN; \
            INSERT INTO book_copy(branchId, bookId) VALUES';
            let values = [];
            for (let i = 0; i < req.body.numCopies; i++) {
                sql += '(?,?),';
                values.push(req.branchId);
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
