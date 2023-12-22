const db = require('../config/db');

class managerController {
    showStaff(req, res) {
        const sql =
            'SELECT * FROM USER JOIN WORK_ON ON USER.userId = WORK_ON.staffId WHERE USER.role = "staff" AND WORK_ON.branchId = ?';
        const values = [req.query.branchId];
        db.query(sql, values, (err, results) => {
            if (err) return res.sendStatus(500);
            res.json(results);
        });
    }
    showCustomer(req, res) {
        const sql = 'SELECT * FROM USER WHERE .role = "customer"';
        db.query(sql, (err, results) => {
            if (err) return res.sendStatus(500);
            res.json(results);
        });
    }
    addStaff(req, res) {
        if (!req.body.userId || !req.body.branchId) return res.sendStatus(400);
        const sql1 =
            'SELECT role FROM USER WHERE userId = ? AND role = "customer"';
        db.query(sql1, [req.body.userId], (err, results) => {
            if (!results[0].role) return res.sendStatus(401);
            const sql2 =
                '\
                INSERT INTO WORK_ON(staffId, branchId) VALUES (?,?); \
                UPDATE USER SET role = "staff" WHERE userId = ?;\
                ';
            const values = [
                req.body.userId,
                req.body.branchId,
                req.body.userId,
            ];

            db.query(sql2, values, (err) => {
                if (err) return res.sendStatus(500);
                res.sendStatus(201);
            });
        });
    }
    deleteStaff(req, res) {
        if (!req.body.userId || !req.body.branchId) return res.sendStatus(400);
        const sql1 = 'SELECT * FROM USER WHERE userId = ? AND role = "staff"';
        db.query(sql1, [req.body.userId], (err, results) => {
            if (!results[0]) return res.sendStatus(401);
            const sql2 =
                '\
                DELETE FROM WORK_ON WHERE staffId = ? AND branchId = ?; \
                UPDATE USER SET role = "customer" WHERE userId = ?;\
                ';
            const values = [
                req.body.userId,
                req.body.branchId,
                req.body.userId,
            ];

            db.query(sql2, values, (err) => {
                if (err) return res.sendStatus(500);
                res.sendStatus(201);
            });
        });
    }
}

module.exports = new managerController();
