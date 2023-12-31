const db = require('../config/db');

class AdminController {

    showAuthor(req,res) {
        const sql =
        'select * from author';

    db.query(sql, (err,results) => {
        if (err) {
            return res.sendStatus(500);
        }
        res.json(results);
    });
    };

    addAuthor(req,res) {
        const sql =
        'INSERT INTO author(authorId, authorName, bornDate)\
    VALUES (?,?,?)';
    const values = [
        req.body.authorId,
        req.body.authorName,
        req.body.bornDate,
    ];

    db.query(sql, values, (err) => {
        if (err) {
            return res.sendStatus(500);
        }
        res.sendStatus(201);
    });
    };

    changeAuthorinfo(req, res) {
        const sql = 'UPDATE author SET authorName = ?, bornDate = ? WHERE authorId = ?';
    const values = [
        req.body.authorName,
        req.body.bornDate,
        req.body.authorId,
    ];

    db.query(sql, values, (err) => {
        if (err) {
            return res.sendStatus(500);
        }
        res.sendStatus(201);
    });
    };

    deleteAuthorinfo(req, res) {
        const sql = 'DELETE FROM author where authorId = ?';
    const values = [
        req.body.authorId,
    ];

    db.query(sql, values, (err) => {
        if (err) {
            return res.sendStatus(500);
        }
        res.sendStatus(201);
    });
    };


    showBranch(req,res) {
        const sql =
        'select * from branch';

    db.query(sql, (err,results) => {
        if (err) {
            return res.sendStatus(500);
        }
        res.json(results);
    });
    };

    addBranch(req,res) {
        const sql =
        'INSERT INTO branch(branchId, address, workingTime)\
    VALUES (?,?,?)';
    const values = [
        req.body.branchId,
        req.body.address,
        req.body.workingTime,
    ];

    db.query(sql, values, (err) => {
        if (err) {
            return res.sendStatus(500);
        }
        res.sendStatus(201);
    });
    };

    changeBranchinfo(req, res) {
        const sql = 'UPDATE branch SET address = ?, workingTime = ?, WHERE branchId = ?';
    const values = [
        req.body.address,
        req.body.workingTime,
        req.body.branchId,
    ];

    db.query(sql, values, (err) => {
        if (err) {
            return res.sendStatus(500);
        }
        res.sendStatus(201);
    });
    };

    deleteBranchinfo(req, res) {
        const sql = 'DELETE from branch WHERE branchId = ?';
    const values = [
        req.body.branchId,
    ];

    db.query(sql, values, (err) => {
        if (err) {
            return res.sendStatus(500);
        }
        res.sendStatus(201);
    });
    };

    showBook(req,res) {
        const sql =
        'select * from book';

    db.query(sql, (err,results) => {
        if (err) {
            return res.sendStatus(500);
        }
        res.json(results);
    });
    };

    addBook(req,res) {
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

    };

    changeBookinfo(req, res) {
        const sql = 'UPDATE book SET title = ?, genre = ?, publicationYear = ?, availableCopies = ?, salePrice = ?, authorId = ? WHERE bookId = ?';
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
    };

    deleteBookinfo(req, res) {
        const sql = 'DELETE from book WHERE bookId = ?';
    const values = [
        req.body.bookId,
    ];

    db.query(sql, values, (err) => {
        if (err) {
            return res.sendStatus(500);
        }
        res.sendStatus(201);
    });
    };

    addBookCopies(req,res) {
        for (let i = 0; i < req.body.numCopies; i++) {
            const sql =
            'INSERT INTO book_copy(branchId, bookId)\
    VALUES (?,?)';
        const values = [
            req.body.branchId,
            req.body.bookId,
        ];

    db.query(sql, values, (err) => {
        if (err) {
            return res.sendStatus(500);
        }
    });

    const sql1 = 'UPDATE book SET availableCopies = availableCopies - 1 WHERE bookId = ?';
    db.query(sql1, [req.body.bookId], err => {
        if (err) return res.sendStatus(500);
            });

        }
        res.sendStatus(201);
    };
    
    addDrinks(req,res) {
        // add book
        const sql =
        'INSERT INTO book(drinkId, drinksName, image)\
    VALUES (?,?,?)';
    const values = [
        req.body.drinkId,
        req.body.drinkName,
    ];

    db.query(sql, values, (err) => {
        if (err) {
            return res.sendStatus(409);
        }
        res.sendStatus(201);
    });

    };

    showStaffandManager(req,res) {
        const sql =
        'select staffId, userName, branchId, address, role from user, work_on where staffId = userId';

    db.query(sql, (err,results) => {
        if (err) {
            return res.sendStatus(500);
        }
        res.json(results);
    });
    };

    showStaff(req,res) {
        const sql =
        'select staffId, userName, address, role from user, work_on where staffId = userId and branchId = ?';

    db.query(sql, [req.params.branchId],(err,results) => {
        if (err) {
            return res.sendStatus(500);
        }
        res.json(results);
    });
    };

    deleteStaff(req,res) {
        const sql = 'DELETE from work_on WHERE staffId = ? and branchId = ?';
        const values = [
            req.body.staffId,
            req.params.branchId
        ];
    
        db.query(sql, values, (err) => {
            if (err) {
                return res.sendStatus(500);
            }
            res.sendStatus(201);
        });
    };

    async addStaff(req,res) {
        const sql =
        'INSERT INTO user(userName, password, email, address, role)\
    VALUES (?,?,?,?,?)';
    const values = [
        req.body.userName,
        req.body.password,
        req.body.email,
        req.body.address,
        req.body.role,
    ];

    db.query(sql, values, (err) => {
        if (err) {
            return res.sendStatus(500);
        }

        let staffId = -1;
        db.query("SELECT userId from user where userName = ?", [req.body.userName], (err, result) => {
            if (err) {
                return res.sendStatus(500);
            }
            let staffId = result[0].userId;

            const sql1 = 'INSERT INTO WORK_ON(staffId, branchId) VALUES (?,?)';

            db.query(sql1, [staffId, req.params.branchId], (err) => {
                if (err) {
                    return res.sendStatus(500);
            }
            
        });
        if (req.body.role == 'manager') {
            const sql2 = 'UPDATE branch set managerId = ? where branchId = ?'
    
            db.query(sql2, [staffId, req.params.branchId], (err) => {
                if (err) {
                    return res.sendStatus(500);
                }
            });
        }

        });

        res.sendStatus(201);
    });
    };

}
module.exports = new AdminController();
