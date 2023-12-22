const db = require('../config/db');

class managerController {
    showStaff(req, res) {
        const sql = 'SELECT * FROM USER JOIN WORK_ON ON USER.userId = WORK_ON.staffId WHERE USER.role = "staff" AND WORK_ON.branchId = ?';
        const values = [req.query.branchId];
        db.query(sql, values, (err, results) => {
            if (err) return res.sendStatus(500);
            res.json(results);
        });
    }
    addStaff(req, res) {
        if(!req.body.userId || !req.body.quantity || !req.body.date) return res.sendStatus(400)
    }

}

module.exports = new managerController();
