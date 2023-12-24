const db = require('../config/db');

class managerController {
    showStaff(req, res) {
        const sql =
            ' \
            SELECT DISTINCT u.userName as staffName, u.email, u.address, w.workingDate FROM USER as u \
            JOIN WORK_ON as w \
            on u.userId = w.staffId \
            WHERE w.branchId IN (SELECT branchId from WORK_ON \
            WHERE staffId = ?) AND u.role = "staff"';

        db.query(sql, [req.userId], (err, results) => {
            if (err) return res.sendStatus(500);
            res.json(results);
        });
    }

    addStaff(req, res) {
        const staffId = req.body.userId;
        if (!staffId) return res.sendStatus(400);
        const sql = 'SELECT role FROM USER WHERE userId = ?';
        db.query(sql, [staffId], (err, results) => {
            if (err) return res.sendStatus(500);
            if(!results[0] || results[0].role !== 'customer') return res.sendStatus(400);

            const sql1 = 'SELECT branchId FROM Work_on WHERE staffId = ?';
            db.query(sql1, [req.userId], (err, results) => {
                if (err) return res.sendStatus(500);
                const sql2 =
                    'BEGIN;\
                    INSERT INTO WORK_ON(staffId, branchId) VALUES (?,?); \
                    UPDATE USER SET role = "staff" WHERE userId = ?;\
                    COMMIT;';
                const values = [ 
                    staffId,
                    results[0].branchId,
                    staffId,
                ];

                db.query(sql2, values, (err) => {
                    if (err) return res.sendStatus(500);
                    res.sendStatus(201);
                });
            });
        });
    }
    deleteStaff(req, res) {
        const staffId = req.body.userId;
        if (!staffId) return res.sendStatus(400);

        const sql1 = 'SELECT branchId FROM WORK_ON as W \
            JOIN user as u \
            ON w.staffId = u.userId \
            WHERE staffId = ? and u.role = "staff"';
            db.query(sql1, [staffId], (err, staff) => {
            if(err) return res.sendStatus(500);
            if(!staff[0]) return res.sendStatus(400);

            const sql2 = 'SELECT branchId FROM WORK_ON WHERE staffId = ?';
            db.query(sql2, [req.userId], (err, manager) => {
                if(err) return res.sendStatus(500);
                if(manager[0].branchId !== staff[0].branchId) return res.sendStatus(400);

                const sql3 =
                'BEGIN;\
                DELETE FROM WORK_ON WHERE staffId = ? AND branchId = ?; \
                UPDATE USER SET role = "customer" WHERE userId = ?;\
                COMMIT;';
                const values = [
                    staffId,
                    staff[0].branchId,
                    staffId,
                ];

                db.query(sql3, values, (err) => {
                    if (err) return res.sendStatus(500);
                    res.sendStatus(201);
                });

            })

        })
    }
}

module.exports = new managerController();
