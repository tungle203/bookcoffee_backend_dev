const db = require('../config/db');

const convertBookFormat = (books) => {
    const result = [];
    const titleMap = {};

    books.map((book) => {
        if (!titleMap[book.title]) {
            titleMap[book.title] = {
                title: book.title,
                author_name: book.author_name,
                genre: book.genre,
                publication_year: book.publication_year,
                branch: [],
            };
            result.push(titleMap[book.title]);
        }
        if (!book.is_borrowed) titleMap[book.title].branch.push(book.branch_id);
    });

    return result;
};

class CustomerController {
    searchBook(req, res) {
        let sql =
            'SELECT DISTINCT b.title, a.author_name, b.genre, b.publication_year, bc.branch_id, bc.is_borrowed\
                        FROM book AS b\
                        JOIN book_copy AS bc\
                        ON  b.book_id = bc.book_id\
                        JOIN author AS a\
                        ON b.author_id = a.author_id ';
        if (req.query.title) sql += 'WHERE b.title LIKE ?';
        const values = [`%${req.query.title}%`];
        const query = db.query(sql, values, (err, results) => {
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
        const query = db.query(sql, (err, results) => {
            if (err) {
                return res.sendStatus(500);
            }
            res.json(results);
        });
    }
    getBookOfBranch(req, res) {
        const sql = 'SELECT DISTINCT bo.title FROM book_copy AS bc\
        JOIN branch AS b\
        ON bc.branch_id = b.branch_id\
        JOIN book AS bo\
        ON bc.book_id = bo.book_id\
        WHERE bc.is_borrowed = 0 AND b.address = ?';

        const values = [req.query.address];
        const query = db.query(sql, values, (err, results) => {
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
    
            const insertQuery = 'INSERT INTO reservations(user_id, branch_id, quantity, reservation_date) VALUES (?,?,?,?)';
            const values = [req.userId, branchId, req.body.quantity, new Date(req.body.date)];
    
            db.query(insertQuery, values, err => {
                if (err) {
                    return res.sendStatus(500);
                }
    
                res.sendStatus(201);
            });
        });
    }
    
    createMeeting(req,res) {
        const branchIdQuery = 'SELECT branch_id FROM branch WHERE address = ?';
        db.query(branchIdQuery, [req.body.address], (err, result) => {
            if (err) {
                return res.sendStatus(500);
            }
    
            const branchId = result[0].branch_id;
            const insertQuery = 'INSERT INTO meetings(host_id, branch_id, meeting_name, meeting_date, description) VALUES (?,?,?,?,?)';
            const values = [req.userId, branchId, req.body.name, new Date(req.body.date), req.body.description];
            
            db.query(insertQuery, values, err => {
                if (err) {
                    return res.sendStatus(500);
                }
    
                res.sendStatus(201);
            });
        });
    }
}

module.exports = new CustomerController();
