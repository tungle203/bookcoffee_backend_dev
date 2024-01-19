const path = require('path');
const db = require('../config/db');
const fs = require('fs');
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
                description: book.description,
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
        const sql = 'UPDATE _USER SET avatar = $1 WHERE userId = $2';
        const values = [req.file.originalname, req.userId];
        db.query(sql, values, (err) => {
            if (err) {
                return res.sendStatus(500);
            }
            res.send({ message: 'Upload avatar successfully' });
        });
    }

    updateProfile(req, res) {
        const { email, address, phoneNumber } = req.body;
        if (!phoneNumber && !email && !address) res.sendStatus(400);

        let sql = 'UPDATE _USER SET ';
        let values = [];
        let position = 1;

        if (email) {
            sql += `email = $${position++},`;
            values.push(email);
        }

        if (address) {
            sql += `address = $${position++},`;
            values.push(address);
        }

        if (phoneNumber) {
            sql += `phoneNumber = $${position++},`;
            values.push(phoneNumber);
        }

        sql = sql.slice(0, -1);
        sql += `WHERE userId = $${position++}`;
        values.push(req.userId);
        db.query(sql, values, (err) => {
            if (err) res.sendStatus(500);
            res.sendStatus(200);
        });
    }

    changePassword(req, res) {
        const { oldPassword, newPassword } = req.body;
        if (!oldPassword || !newPassword) return res.sendStatus(400);

        const sql = 'SELECT password FROM _USER WHERE userId = $1';
        db.query(sql, [req.userId], (err, results) => {
            if (err) return res.sendStatus(500);
            if (results.rows[0].password !== oldPassword) return res.sendStatus(400);

            const sql1 = 'UPDATE _USER SET password = $1 WHERE userId = $2';
            db.query(sql1, [newPassword, req.userId], (err) => {
                if (err) return res.sendStatus(500);
                res.sendStatus(200);
            });
        });
    }

    getProfile(req, res) {
        const sql =
            'SELECT userName as "userName", email, address, phoneNumber as "phoneNumber" FROM _USER WHERE userId = $1';
        db.query(sql, [req.userId], (err, results) => {
            if (err) {
                return res.sendStatus(500);
            }
            res.json(results.rows[0]);
        });
    }

    getAvatar(req, res) {
        const sql = 'SELECT avatar FROM _USER WHERE userId = $1';
        db.query(sql, [req.userId], (err, results) => {
            if (err) {
                return res.sendStatus(500);
            }

            if (!results.rows[0] || !results.rows[0].avatar) {
                return res.sendStatus(404);
            }

            const avatarPath = path.join(
                __dirname,
                `../../${process.env.AVATAR_PATH}/${results.rows[0].avatar}`,
            );

            if (fs.existsSync(avatarPath)) {
                res.sendFile(avatarPath);
            } else {
                res.sendStatus(404);
            }
        });
    }

    getBookImage(req, res) {
        if(!req.params.bookId) return res.sendStatus(400);

        const sql = `SELECT image FROM _BOOK WHERE bookId = $1`;

        db.query(sql, [req.params.bookId], (err, results) => {
            if (err) {
                return res.sendStatus(500);
            }
            if (!results.rows[0] || !results.rows[0].image) {
                return res.sendStatus(404);
            }

            const bookImagePath = path.join(
                __dirname,
                `../../${process.env.BOOK_PATH}/${results.rows[0].image}`,
            );

            if (fs.existsSync(bookImagePath)) {
                res.sendFile(bookImagePath);
            } else {
                res.sendStatus(404);
            }
        });
    }

    getBranchImage(req, res) {
        const sql = 'SELECT image FROM _BRANCH WHERE branchId = $1';
        db.query(sql, [req.params.branchId], (err, results) => {
            if (err) {
                return res.sendStatus(500);
            }

            if (!results.rows[0] || !results.rows[0].image) {
                return res.sendStatus(404);
            }

            const branchImagePath = path.join(
                __dirname,
                `../../${process.env.BRANCH_PATH}/${results.rows[0].image}`,
            );

            if (fs.existsSync(branchImagePath)) {
                res.sendFile(branchImagePath);
            } else {
                res.sendStatus(404);
            }
        });
    }

    searchBook(req, res) {
        let sql =
            'SELECT bc.copyId as "copyId", b.title, a.authorName as "authorName", b.genre, b.publicationYear as "publicationYear", b.salePrice as "salePrice", b.description, br.address, bc.isBorrowed as "isBorrowed", b.bookId as "bookId"\
                        FROM _BOOK AS b\
                        LEFT JOIN _BOOK_COPY AS bc\
                        ON  b.bookId = bc.bookId\
                        LEFT JOIN _BRANCH AS br\
                        ON bc.branchId = br.branchId\
                        JOIN _AUTHORS AS a\
                        ON b.authorId = a.authorId ';
        let values = [];
        let position = 1;

        if (req.query.title && req.query.address) {
            sql +=
                `WHERE (b.title LIKE $${position++} OR a.authorName LIKE $${position++}) AND br.address = $${position++}`;
            values = [
                `%${req.query.title}%`,
                `%${req.query.title}%`,
                req.query.address,
            ];
        }

        if (req.query.title && !req.query.address) {
            sql += `WHERE (b.title LIKE $${position++} OR a.authorName LIKE $${position++})`;
            values = [`%${req.query.title}%`, `%${req.query.title}%`];
        }

        if (!req.query.title && req.query.address) {
            sql += `WHERE br.address = $${position++}`;
            values = [req.query.address];
        }

        if (req.branchId) {
            sql += ` AND br.branchId = $${position++}`;
            values.push(req.branchId);
        }

        db.query(sql, values, (err, results) => {
            if (err) {
                return res.sendStatus(500);
            }
            res.json(convertBookFormat(results.rows));
        });
    }

    searchBookByGenre(req, res) {
        const sql =
            'SELECT bc.copyId as "copyId", b.title, a.authorName as "authorName", b.genre, b.publicationYear as "publicationYear", b.salePrice as "salePrice", b.description, br.address, bc.isBorrowed as "isBorrowed", b.bookId as "bookId"\
                        FROM _BOOK AS b\
                        LEFT JOIN _BOOK_COPY AS bc\
                        ON  b.bookId = bc.bookId\
                        LEFT JOIN _BRANCH AS br\
                        ON bc.branchId = br.branchId\
                        JOIN _AUTHORS AS a\
                        ON b.authorId = a.authorId\
                        WHERE b.genre = $1';
        db.query(sql, [req.query.genre], (err, results) => {
            if (err) {
                return res.sendStatus(500);
            }
            res.json(convertBookFormat(results.rows));
        });
    }

    getBranchInfo(req, res) {
        const sql =
            'SELECT b.address, b.workingTime as "workingTime", u.userName AS "managerName", u.email FROM _BRANCH AS b\
        JOIN _USER AS u\
        ON b.managerId = u.userId';
        db.query(sql, (err, results) => {
            if (err) {
                return res.sendStatus(500);
            }
            res.json(results.rows);
        });
    }

    createReservation(req, res) {
        if (!req.body.address || !req.body.quantity || !req.body.date)
            return res.sendStatus(400);

        const branchIdQuery = 'SELECT branchId as "branchId" FROM _BRANCH WHERE address = $1';
        db.query(branchIdQuery, [req.body.address], (err, result) => {
            if (err) {
                return res.sendStatus(500);
            }

            const branchId = result.rows[0].branchId;

            const insertQuery =
                'INSERT INTO _RESERVATIONS(userId, branchId, quantity, reservationDate) VALUES ($1,$2,$3,$4)';
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
            'SELECT b.address, r.reservationDate as "reservationDate", r.quantity, r.isConfirm as "isConfirm" FROM _RESERVATIONS AS r\
        JOIN _BRANCH AS b\
        ON r.branchId = b.branchId\
        WHERE r.userId = ?';

        db.query(sql, [req.userId], (err, results) => {
            if (err) {
                return res.sendStatus(500);
            }
            res.json(results.rows);
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

        const branchIdQuery = 'SELECT branchId as "branchId" FROM branch WHERE address = $1';
        db.query(branchIdQuery, [req.body.address], (err, result) => {
            if (err) {
                return res.sendStatus(500);
            }

            const branchId = result.rows[0].branchId;
            const insertQuery =
                'INSERT INTO meetings(hostId, branchId, meetingName, meetingDate, description) VALUES ($1,$2,$3,$4,$5)';
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
            const sql =
                'SELECT bc.copyId, b.title, bb.borrowDate as "borrowDate", bb.returnDate as "returnDate", bb.isReturn as "isReturn", bb.deposit\
            FROM _BORROW_BOOK_TO_GO AS bb\
            JOIN _BOOK_COPY AS bc\
            ON bb.copyId = bc.copyId\
            JOIN _BOOK AS b\
            ON bc.bookId = b.bookId\
            WHERE bb.userId = $1';
            db.query(sql, [req.userId], (err, results) => {
                if (err) return res.sendStatus(500);
                res.json(results.rows);
            });
        };
}

module.exports = new CustomerController();
