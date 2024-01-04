const path = require('path');
const db = require('../config/db');

const convertDrinksFormat = (drinks) => {
    const result = [];
    const titleMap = {};

    drinks.map((drink) => {
        if (!titleMap[drink.drinksId]) {
            titleMap[drink.drinksId] = {
                drinksId: drink.drinksId,
                drinksName: drink.drinksName,
                image: drink.image,
                price: [],
                size: [],
            };
            result.push(titleMap[drink.drinksId]);
        }
        titleMap[drink.drinksId].size.push(drink.size);
        titleMap[drink.drinksId].price.push(drink.price);
    });

    return result;
};

class StaffController {
    showDrinks(req, res) {
        const sql = 'SELECT d.drinksId, d.drinksName, d.image, ds.size, ds.price FROM DRINKS as d \
        JOIN DRINKS_SIZE as ds \
        ON d.drinksId = ds.drinksId';
        db.query(sql, (err, results) => {
            if (err) return res.sendStatus(500);
            res.json(convertDrinksFormat(results));
        });
    }

    getDrinksImage(req, res) {
        const sql = 'SELECT image FROM DRINKS WHERE drinksId = ?';
        db.query(sql, [req.params.drinksId], (err, results) => {
            if (err) {
                return res.sendStatus(500);
            }
            if (!results[0].image) {
                return res.sendStatus(404);
            }
            res.sendFile(path.join(__dirname, `../../${process.env.DRINKS_PATH}/${results[0].image}`));
        
        });
    }
    addDrinksBill(req, res) {
        const sql = 'SELECT branchId FROM WORK_ON WHERE staffId = ?';
        db.query(sql, [req.userId], (err, results) => {
            if (err) return res.sendStatus(500);
            const sql1 = 'INSERT INTO BILL(staffId, branchId) VALUES (?,?);';
            const values = [req.userId, results[0].branchId];

            db.query(sql1, values, (err, results) => {
                if (err) return res.sendStatus(500);
                let sql2 = 'BEGIN; \
                INSERT INTO DRINKS_BILL(billId, drinksId, size, count) VALUES ';
                let values = [];
                req.body.map((item) => {
                    sql2 += '(?,?,?,?),';
                    values.push(results.insertId);
                    values.push(item.drinksId);
                    values.push(item.size);
                    values.push(item.quantity);
                });
                sql2 = sql2.slice(0, -1);
                sql2 += '; \
                SELECT price FROM BILL WHERE billId = ?;\
                SELECT userName FROM USER WHERE userId = ?;\
                COMMIT;';
                values.push(results.insertId);
                values.push(req.userId);
                db.query(sql2, values, (err, results) => {
                    if (err) return res.sendStatus(500);
                    res.status(201).send({ price: results[2][0].price, staffName: results[3][0].userName });
                });
            });
        });
    }

    showReservation(req, res) {
        const sql =
            'SELECT r.reservationId, u.userName, b.address, r.reservationDate, r.quantity, r.isConfirm FROM RESERVATIONS AS r\
        JOIN USER AS u\
        ON r.userId = u.userId\
        JOIN BRANCH AS b\
        ON r.branchId = b.branchId\
        WHERE r.branchId = ?';

        db.query(sql, [req.branchId], (err, results) => {
            if (err) {
                return res.sendStatus(500);
            }
            res.json(results);
        });
    }
    
    confirmReservation(req, res) {
        const reservationId = req.body.reservationId;
        if (!reservationId) return res.sendStatus(400);

        const sql =
            'UPDATE RESERVATIONS SET staffId = ?, isConfirm = TRUE WHERE reservationId = ?';
        const values = [req.userId, reservationId];

        db.query(sql, values, (err) => {
            if (err) {
                return res.sendStatus(500);
            }
            return res.sendStatus(200);
        });
    }

    borrowBookAtBranch(req, res) {
        const { copyId, userName, idCard, phoneNumber, address } = req.body;
        if(!copyId || !userName) return res.sendStatus(400);
        const sql = 'BEGIN; \
        INSERT INTO BORROW_BOOK_AT_BRANCH(copyId, customerName, citizenId, phoneNumber, address, staffId, branchId) VALUES (?,?,?,?,?,?,?); \
        UPDATE BOOK_COPY SET isBorrowed = TRUE WHERE copyId = ?;\
        COMMIT;';
        const values = [copyId, userName, idCard, phoneNumber, address, req.userId, req.branchId, copyId];
        db.query(sql, values, (err) => {
            if (err) return res.sendStatus(500);
            res.sendStatus(201);
        });
    }

    showBorrowBookAtBranch(req, res) {
        let sql = 'SELECT bbb.borrowingId, bbb.customerName, bbb.citizenId, bbb.phoneNumber, bbb.borrowDate, bbb.returnDate, bbb.isReturn, b.title FROM BORROW_BOOK_AT_BRANCH AS bbb \
        JOIN BOOK_COPY AS bc \
        ON bbb.copyId = bc.copyId \
        JOIN BOOK AS b \
        ON bc.bookId = b.bookId';

        if(req.role === 'staff') {
            sql += ' WHERE bbb.branchId = ?';
        }

        sql += ' ORDER BY bbb.isReturn ASC';
        db.query(sql, [req.branchId], (err, results) => {
            if (err) return res.sendStatus(500);
            res.json(results);
        });
    }

    returnBookAtBranch(req, res) {
        const borrowingId = req.body.borrowingId;
        if (!borrowingId) return res.sendStatus(400);

        const sql = 'SELECT copyId FROM BORROW_BOOK_AT_BRANCH WHERE borrowingId = ?';
        db.query(sql, [borrowingId], (err, results) => {
            if (err) return res.sendStatus(500);
            const sql1 = 'BEGIN; \
            UPDATE BOOK_COPY SET isBorrowed = FALSE WHERE copyId = ?; \
            UPDATE BORROW_BOOK_AT_BRANCH SET isReturn = TRUE, confirmStaff = ? WHERE borrowingId = ?; \
            COMMIT;';
            db.query(sql1, [results[0].copyId, req.userId,borrowingId], (err) => {
                if (err) return res.sendStatus(500);

                res.sendStatus(200);
            });
        });
    }

    borrowBookToGo(req, res) {
        const userName = req.body.userName;
        const copyId = req.body.copyId;
        if (!userName || !copyId) return res.sendStatus(400);

        const sql1 = 'SELECT userId FROM USER WHERE userName = ?';
        db.query(sql1, [userName], (err, results) => {
            if (!results[0]) return res.sendStatus(400);

            const sql2 =
                'BEGIN;\
                INSERT INTO BORROW_BOOK_TO_GO(userId, copyId, staffId, branchId) VALUE (?,?,?,?); \
                UPDATE BOOK_COPY SET isBorrowed = TRUE WHERE copyId = ?;\
                COMMIT';
            const values = [results[0].userId, copyId, req.userId, req.branchId, copyId];

            db.query(sql2, values, (err) => {
                if (err) return res.sendStatus(500);
                res.sendStatus(201);
            });
        });
    }

    showBorrowBookToGo(req, res) {
        let sql = 'SELECT bbtg.borrowingId, u.userName, bbtg.borrowDate, bbtg.returnDate, bbtg.isReturn, bbtg.deposit, b.title FROM BORROW_BOOK_TO_GO AS bbtg \
        JOIN BOOK_COPY AS bc \
        ON bbtg.copyId = bc.copyId \
        JOIN BOOK AS b \
        ON bc.bookId = b.bookId \
        JOIN USER AS u \
        ON bbtg.userId = u.userId';

        if(req.role === 'staff') {
            sql += ' WHERE bbtg.branchId = ?';
        }

        if(req.query.userName) {
            sql += ' AND u.userName = ?';
        }
        sql += ' ORDER BY bbtg.isReturn ASC';
        db.query(sql, [req.branchId, req.query.userName], (err, results) => {
            if (err) return res.sendStatus(500);
            res.json(results);
        });
    }

    returnBookToGo(req, res) {
        const borrowingId = req.body.borrowingId;
        if (!borrowingId) return res.sendStatus(400);

        const sql = 'SELECT copyId FROM BORROW_BOOK_TO_GO WHERE borrowingId = ?';
        db.query(sql, [borrowingId], (err, results) => {
            if (err) return res.sendStatus(500);
            const sql1 = 'BEGIN; \
            UPDATE BOOK_COPY SET isBorrowed = FALSE WHERE copyId = ?; \
            UPDATE BORROW_BOOK_TO_GO SET isReturn = TRUE, returnDate = current_timestamp, confirmStaff = ? WHERE borrowingId = ?; \
            COMMIT;';
            db.query(sql1, [results[0].copyId, req.userId,borrowingId], (err) => {
                if (err) return res.sendStatus(500);

                res.sendStatus(200);
            });
        });
    }
}

module.exports = new StaffController();
