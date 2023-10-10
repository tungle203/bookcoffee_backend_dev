const db = require('../config/db');

class StaffController {
    show(req, res, next) {
        const sql = 'SELECT * FROM user';
        const query = db.query(sql, (err, results) => {
            if (err) next(err);
            res.json(results);
        });
    }
}

module.exports = new StaffController();
