const db = require('../config/db');

class managerController {
    showStaff(req, res) {
        const sql =
            'SELECT userId,userName,email, USER.address,BRANCH.branchId ,  BRANCH.address AS workAt  FROM USER JOIN WORK_ON ON USER.userId = WORK_ON.staffId JOIN BRANCH ON WORK_ON.branchId = BRANCH.branchId  WHERE USER.role = "staff" AND BRANCH.managerId = ?';
        const values = [req.userId];
        db.query(sql, values, (err, results) => {
            if (err) return res.sendStatus(500);
            res.json(results);
        });
    }
    showCustomer(req, res) {
        let sql = 'SELECT userId, userName, email, address, createdDate FROM USER WHERE role = "customer"';
        let value = [];
        if (req.query.userName) {
            sql += 'AND userName LIKE ?';
            value = [`%${req.query.userName}%`];
        }
        db.query(sql, value, (err, results) => {
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
    

    addBook(req, res) {
        // add book
        const sql =
            'INSERT INTO book(bookId, title, genre, publicationYear, availableCopies, salePrice, authorId)\
    VALUES (?,?,?,?,?,?,?)';
        const values = [
            req.body.bookId,
            req.body.title,
            req.body.genre,
            req.body.publicationYear,
            req.body.availableCopies,
            req.body.salePrice,
            req.body.authorId,
        ];

        db.query(sql, values, (err) => {
            if (err) {
                return res.sendStatus(500);
            }
            res.sendStatus(201);
        });
    }

    changeBookinfo(req, res) {
        const sql =
            'UPDATE book SET title = ?, genre = ?, publicationYear = ?, availableCopies = ?, salePrice = ?, authorId = ? WHERE bookId = ?';
        const values = [
            req.body.title,
            req.body.genre,
            req.body.publicationYear,
            req.body.availableCopies,
            req.body.salePrice,
            req.body.authorId,
            req.body.bookId,
        ];

        db.query(sql, values, (err) => {
            if (err) {
                return res.sendStatus(500);
            }
            res.sendStatus(201);
        });
    }

    addBookCopies(req, res) {
        for (let i = 0; i < req.body.numCopies; i++) {
            const sql =
                'INSERT INTO book_copy(branchId, bookId)\
    VALUES (?,?)';
            const values = [req.body.branchId, req.body.bookId];

            db.query(sql, values, (err) => {
                if (err) {
                    return res.sendStatus(500);
                }
            });

            const sql1 =
                'UPDATE book SET availableCopies = availableCopies - 1 WHERE bookId = ?';
            db.query(sql1, [req.body.bookId], (err) => {
                if (err) return res.sendStatus(500);
            });
        }
        res.sendStatus(201);
    }
}

module.exports = new managerController();
