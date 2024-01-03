const path = require('path');
const db = require('../config/db');
const multer = require('multer');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, process.env.AVATAR_PATH)
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
});

const upload = multer({ storage: storage });


const convertBookFormat = (books) => {
    const result = [];
    const titleMap = {};

    books.map((book) => {
        if (!titleMap[book.title]) {
            titleMap[book.title] = {
                copyId: [],
                branch: [],
                isBorrowed: [],
                bookId: book.bookId,
                title: book.title,
                authorName: book.authorName,
                genre: book.genre,
                publicationYear: book.publicationYear,
                salePrice: book.salePrice,
            };
            result.push(titleMap[book.title]);
        }
            titleMap[book.title].copyId.push(book.copyId);
            titleMap[book.title].branch.push(book.address);
            titleMap[book.title].isBorrowed.push(book.isBorrowed);
        });

    return result;
};

class CustomerController {

    uploadAvatar(req, res) {
        // create upload avatar function here
        upload.single('avatar')(req, res, (err) => {
            if (err) {
                return res.sendStatus(500);
            }
            const sql = 'UPDATE user SET avatar = ? WHERE userId = ?';
            const values = [req.file.originalname, req.userId];
            db.query(sql, values, (err) => {
                if (err) {
                    return res.sendStatus(500);
                }
                res.send({ message: 'Upload avatar successfully' });
            });
        })
    }

    updateProfile(req, res) {
        const { email, address, phoneNumber } = req.body
        if(!phoneNumber && !email && !address) res.sendStatus(400)

        let sql = 'UPDATE user SET ';
        let values = [];

        if(email) {
            sql += 'email = ?,';
            values.push(email);
        }

        if(address) {
            sql += 'address = ?,';
            values.push(address);
        }

        if(phoneNumber) {
            sql += 'phoneNumber = ?,';
            values.push(phoneNumber);
        }

        sql = sql.slice(0, -1);
        sql += 'WHERE userId = ?';
        values.push(req.userId)
        db.query(sql, values, err => {
            if(err) res.sendStatus(500);
            res.sendStatus(200);
        })
        
    }

    changePassword(req, res) {
        const { oldPassword, newPassword } = req.body;
        if(!oldPassword || !newPassword) return res.sendStatus(400);

        const sql = 'SELECT password FROM user WHERE userId = ?';
        db.query(sql, [req.userId], (err, results) => {
            if(err) return res.sendStatus(500);
            if(results[0].password !== oldPassword) return res.sendStatus(400);

            const sql1 = 'UPDATE user SET password = ? WHERE userId = ?';
            db.query(sql1, [newPassword, req.userId], err => {
                if(err) return res.sendStatus(500);
                res.sendStatus(200);
            })
        })
    }

    getProfile(req, res) {
        const sql = 'SELECT userName, email, address, phoneNumber FROM user WHERE userId = ?';
        db.query(sql, [req.userId], (err, results) => {
            if (err) {
                return res.sendStatus(500);
            }
            res.json(results[0]);
        });
    }

    getAvatar(req, res) {
        const sql = 'SELECT avatar FROM user WHERE userId = ?';
        db.query(sql, [req.userId], (err, results) => {
            if (err) {
                return res.sendStatus(500);
            }
            if (!results[0].avatar) {
                return res.sendStatus(404);
            }
            res.sendFile(path.join(__dirname, `../../${process.env.AVATAR_PATH}/${results[0].avatar}`));
        });
    }

    getBookImage(req, res) {
        const sql = 'SELECT image FROM BOOK WHERE bookId = ?';
        db.query(sql, [req.params.bookId], (err, results) => {
            if (err) {
                return res.sendStatus(500);
            }
            if (!results[0]) {
                return res.sendStatus(404);
            }
            if (!results[0].image) {
                return res.sendStatus(404);
            }
            res.sendFile(path.join(__dirname, `../../${process.env.BOOK_PATH}/${results[0].image}`));
        }
        );
    }

    getBranchImage(req, res) {
        const sql = 'SELECT image FROM BRANCH WHERE branchId = ?';
        db.query(sql, [req.params.branchId], (err, results) => {
            if (err) {
                return res.sendStatus(500);
            }

            if (!results[0]) {
                return res.sendStatus(404);
            }

            if (!results[0].image) {
                return res.sendStatus(404);
            }
            res.sendFile(path.join(__dirname, `../../${process.env.BRANCH_PATH}/${results[0].image}`));
        }
        );
    }

    searchBook(req, res) {
        let sql =
            'SELECT bc.copyId, b.title, a.authorName, b.genre, b.publicationYear, b.salePrice, br.address, bc.isBorrowed, b.bookId\
                        FROM BOOK AS b\
                        LEFT JOIN book_copy AS bc\
                        ON  b.bookId = bc.bookId\
                        LEFT JOIN branch AS br\
                        ON bc.branchId = br.branchId\
                        JOIN author AS a\
                        ON b.authorId = a.authorId ';
        let values = [];

        if (req.query.title && req.query.address) {
            sql +=
                'WHERE (b.title LIKE ? OR a.authorName LIKE ?) AND br.address = ?';
            values = [
                `%${req.query.title}%`,
                `%${req.query.title}%`,
                req.query.address,
            ];
        }

        if (req.query.title && !req.query.address) {
            sql += 'WHERE (b.title LIKE ? OR a.authorName LIKE ?)';
            values = [`%${req.query.title}%`, `%${req.query.title}%`];
        }

        if (!req.query.title && req.query.address) {
            sql += 'WHERE br.address = ?';
            values = [req.query.address];
        }
        
        if(req.branchId) {
            sql += ' AND br.branchId = ?';
            values.push(req.branchId);
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
        if (!req.body.address || !req.body.quantity || !req.body.date)
            return res.sendStatus(400);

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

    showReservation(req, res) {
        const sql =
            'SELECT b.address, r.reservationDate, r.quantity, r.isConfirm FROM RESERVATIONS AS r\
        JOIN BRANCH AS b\
        ON r.branchId = b.branchId\
        WHERE r.userId = ?';

        db.query(sql, [req.userId], (err, results) => {
            if (err) {
                return res.sendStatus(500);
            }
            res.json(results);
        });
    }

    createMeeting(req, res) {
        if (
            !req.body.address ||
            !req.body.name ||
            !req.body.date ||
            !req.body.description
        )
            return res.sendStatus(400);

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
        const userName = req.body.userName;

        const returnResult = (userID) => {
            const sql =
                'SELECT bc.copyId, b.title, bb.borrowingDate\
            FROM bookborrowings AS bb\
            JOIN book_Copy AS bc\
            ON bb.copyId = bc.copyId\
            JOIN book AS b\
            ON bc.bookId = b.bookId\
            WHERE bb.userId = ?';
            db.query(sql, [userID], (err, results) => {
                if (err) return res.sendStatus(500);
                res.json(results);
            });
        };

        if (userName) {
            const sql1 = 'SELECT userId FROM user WHERE userName = ?';
            db.query(sql1, [userName], (err, results) => {
                if (err) return res.sendStatus(500);
                if (!results[0]) return res.sendStatus(400);
                returnResult(results[0].userId);
            });
        } else returnResult(req.userId);
    }
}

module.exports = new CustomerController();
