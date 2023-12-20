const db = require('../config/db');

const convertBookFormat = (books) => {
    const result = [];
    const titleMap = {};

    books.map((book) => {
        if (!titleMap[book.title]) {
            titleMap[book.title] = {
                copyId: [],
                title: book.title,
                authorName: book.authorName,
                genre: book.genre,
                publicationYear: book.publicationYear,
                branch: [],
            };
            result.push(titleMap[book.title]);
        }
        if (!book.isBorrowed) {
            titleMap[book.title].copyId.push(book.copyId);
            if(!titleMap[book.title].branch.includes(book.address)) {
                titleMap[book.title].branch.push(book.address);
            }
        }
    });

    return result;
};

class CustomerController {
    searchBook(req, res) {
        let sql =
            'SELECT DISTINCT bc.copyId, b.title, a.authorName, b.genre, b.publicationYear, br.address, bc.isBorrowed\
                        FROM BOOK AS b\
                        JOIN bookCopy AS bc\
                        ON  b.bookId = bc.bookId\
                        JOIN branch AS br\
                        ON bc.branchId = br.branchId\
                        JOIN author AS a\
                        ON b.authorId = a.authorId ';
        let values = []

        if (req.query.title && req.query.address) {
            sql += 'WHERE (b.title LIKE ? OR a.authorName LIKE ?) AND br.address = ?';
            values = [`%${req.query.title}%`, `%${req.query.title}%`, req.query.address];
        }

        if(req.query.title && !req.query.address) {
            sql += 'WHERE b.title LIKE ? OR a.authorName LIKE ?';
            values = [`%${req.query.title}%`, `%${req.query.title}%`];
        }

        if(!req.query.title && req.query.address) {
            sql += 'WHERE br.address = ?';
            values = [req.query.address];
        }

        db.query(sql, values, (err, results) => {
            if (err) {
                return res.sendStatus(500);
            }
            res.json(convertBookFormat(results));
        });
    }

    getBranchInfo(req, res) {
        const sql =
            'SELECT b.address, b.workingTime, u.userName AS managerName, u.email FROM branch AS b\
        JOIN user AS u\
        ON b.managerId = u.userId';
        db.query(sql, (err, results) => {
            if (err) {
                return res.sendStatus(500);
            }
            res.json(results);
        });
    }
    
    createReservation(req, res) {
        if(!req.body.address || !req.body.quantity || !req.body.date) return res.sendStatus(400)

        const branchIdQuery = 'SELECT branchId FROM branch WHERE address = ?';
        db.query(branchIdQuery, [req.body.address], (err, result) => {
            if (err) {
                return res.sendStatus(500);
            }

            const branchId = result[0].branchId;

            const insertQuery =
                'INSERT INTO reservations(userId, branchId, quantity, reservationDate) VALUES (?,?,?,?)';
            const values = [
                req.userId,
                branchId,
                req.body.quantity,
                new Date(req.body.date),
            ];

            db.query(insertQuery, values, (err) => {
                if (err) {
                    return res.sendStatus(500);
                }

                res.sendStatus(201);
            });
        });
    }

    createMeeting(req, res) {
        if(!req.body.address || !req.body.name || !req.body.date || !req.body.description) return res.sendStatus(400)

        const branchIdQuery = 'SELECT branchId FROM branch WHERE address = ?';
        db.query(branchIdQuery, [req.body.address], (err, result) => {
            if (err) {
                return res.sendStatus(500);
            }

            const branchId = result[0].branchId;
            const insertQuery =
                'INSERT INTO meetings(hostId, branchId, meetingName, meetingDate, description) VALUES (?,?,?,?,?)';
            const values = [
                req.userId,
                branchId,
                req.body.name,
                new Date(req.body.date),
                req.body.description,
            ];

            db.query(insertQuery, values, (err) => {
                if (err) {
                    return res.sendStatus(500);
                }

                res.sendStatus(201);
            });
        });
    }

    showBookBorrowing(req, res) {
        const userName = req.body.userName

        const returnResult = userID => {
            const sql = 'SELECT bc.copyId, b.title, bb.borrowingDate\
            FROM bookborrowings AS bb\
            JOIN bookCopy AS bc\
            ON bb.copyId = bc.copyId\
            JOIN book AS b\
            ON bc.bookId = b.bookId\
            WHERE bb.userId = ?'
            db.query(sql, [userID], (err, results) => {
                if(err) return res.sendStatus(500)
                res.json(results)
            })
        }

        if(userName) {
            const sql1 = 'SELECT userId FROM user WHERE userName = ?'
            db.query(sql1, [userName], (err, results) => {
                if(err) return res.sendStatus(500)
                if(!results[0]) return res.sendStatus(400)
                returnResult(results[0].userId)
            })
        } else returnResult(req.userId)
    }
}

module.exports = new CustomerController();
