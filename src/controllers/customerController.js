const db = require('../config/db');

const convertBookFormat = (books) => {
    const result = [];
    const titleMap = {};

    books.map((book) => {
        if (!titleMap[book.title]) {
            titleMap[book.title] = {
                copy_id: book.copy_id,
                title: book.title,
                author_name: book.author_name,
                genre: book.genre,
                publication_year: book.publication_year,
                branch: [],
            };
            result.push(titleMap[book.title]);
        }
        if (!book.is_borrowed) titleMap[book.title].branch.push(book.address);
    });

    return result;
};

class CustomerController {
    searchBook(req, res) {
        let sql =
            'SELECT DISTINCT bc.copy_id, b.title, a.author_name, b.genre, b.publication_year, br.address, bc.is_borrowed\
                        FROM book AS b\
                        JOIN book_copy AS bc\
                        ON  b.book_id = bc.book_id\
                        JOIN branch AS br\
                        ON bc.branch_id = br.branch_id\
                        JOIN author AS a\
                        ON b.author_id = a.author_id ';
        if (req.query.title) sql += 'WHERE b.title LIKE ?';
        const values = [`%${req.query.title}%`];
        db.query(sql, values, (err, results) => {
            if (err) {
                return res.sendStatus(500);
            }
            res.json(convertBookFormat(results));
        });
    }

    getBranchInfo(req, res) {
        const sql =
            'SELECT b.address, b.working_time, u.user_name, u.email FROM branch AS b\
        JOIN user AS u\
        ON b.manager_id = u.user_id';
        db.query(sql, (err, results) => {
            if (err) {
                return res.sendStatus(500);
            }
            res.json(results);
        });
    }
    getBookOfBranch(req, res) {
        const sql =
            'SELECT DISTINCT bo.title, a.author_name, bo.genre, bo.publication_year FROM book_copy AS bc\
        JOIN branch AS b\
        ON bc.branch_id = b.branch_id\
        JOIN book AS bo\
        ON bc.book_id = bo.book_id\
        JOIN author AS a\
        ON bo.author_id = a.author_id\
        WHERE bc.is_borrowed = 0 AND b.address = ?';

        const values = [req.query.address];
        db.query(sql, values, (err, results) => {
            if (err) {
                return res.sendStatus(500);
            }
            res.json(results);
        });
    }

    createReservation(req, res) {
        const branchIdQuery = 'SELECT branch_id FROM branch WHERE address = ?';
        db.query(branchIdQuery, [req.body.address], (err, result) => {
            if (err) {
                return res.sendStatus(500);
            }

            const branchId = result[0].branch_id;

            const insertQuery =
                'INSERT INTO reservations(user_id, branch_id, quantity, reservation_date) VALUES (?,?,?,?)';
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
        const branchIdQuery = 'SELECT branch_id FROM branch WHERE address = ?';
        db.query(branchIdQuery, [req.body.address], (err, result) => {
            if (err) {
                return res.sendStatus(500);
            }

            const branchId = result[0].branch_id;
            const insertQuery =
                'INSERT INTO meetings(host_id, branch_id, meeting_name, meeting_date, description) VALUES (?,?,?,?,?)';
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
        const userName = req.body.user_name

        const returnResult = userID => {
            const sql = 'SELECT bc.copy_id, b.title, bb.borrowing_date\
            FROM bookborrowings AS bb\
            JOIN book_copy AS bc\
            ON bb.copy_id = bc.copy_id\
            JOIN book AS b\
            ON bc.book_id = b.book_id\
            WHERE bb.user_id = ?'
            db.query(sql, [userID], (err, results) => {
                if(err) return res.sendStatus(500)
                res.json(results)
            })
        }

        if(userName) {
            const sql1 = 'SELECT user_id FROM user WHERE user_name = ?'
            db.query(sql1, [userName], (err, results) => {
                if(err) return res.sendStatus(500)
                returnResult(results[0].user_id)
            })
        } else returnResult(req.userId)
    }
}

module.exports = new CustomerController();
