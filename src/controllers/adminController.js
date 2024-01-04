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
        if(!req.body.authorName) return res.sendStatus(400);
        const sql =
        'INSERT INTO author(authorName, bornDate)\
    VALUES (?,?)';
    const values = [
        req.body.authorName,
        new Date(req.body.bornDate),
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
        'select b.branchId, b.address, b.workingTime, b.managerId, u.userName as managerName, u.phoneNumber from branch as b\
        JOIN user as u ON b.managerId = u.userId';

        db.query(sql, (err,results) => {
            if (err) {
                return res.sendStatus(500);
            }
            res.json(results);
        });
    };

    addBranch(req,res) {
        const { address, workingTime, managerName, password } = req.body;
        if(!address || !workingTime || !managerName || !password) return res.sendStatus(400);

        const sql = 'BEGIN; \
        INSERT INTO user(userName, password, role) VALUE (?,?,"manager");\
        SET @managerId = LAST_INSERT_ID();\
        INSERT INTO branch(address, workingTime, managerId, image) VALUES (?,?,@managerId,?);\
        SET @branchId = LAST_INSERT_ID();\
        INSERT INTO work_on(staffId, branchId) VALUES (@managerId, @branchId);\
        COMMIT;';

        const branchImage = req.file ? req.file.filename : null;
        const values = [ managerName, password, address, workingTime, branchImage ];

        db.query(sql, values, (err) => {
            if(err && err.code === 'ER_DUP_ENTRY') return res.status(409).send({message: 'username already exists'});
            if (err) {
                return res.sendStatus(500);
            }
            res.sendStatus(201);
        });
    };

    addBook(req,res) {
        const bookImage = req.file ? req.file.filename : null;
        const { title, genre, publicationYear, salePrice, authorName, description } = req.body;
        if(!title || !genre || !publicationYear || !salePrice || !authorName) return res.sendStatus(400);

        const sql = 'SELECT authorId from author where authorName = ?';
        db.query(sql, [authorName], (err, result) => {
            if (err) {
                return res.sendStatus(500);
            }
            
            if(result.length === 0) return res.sendStatus(400);
            const sql1 =
                'INSERT INTO book(title, genre, publicationYear, salePrice, authorId, image, description)\
                VALUES (?,?,?,?,?,?,?)';
            const values = [
                title,
                genre,
                publicationYear,
                salePrice,
                result[0].authorId,
                bookImage,
                description,
            ];

            db.query(sql1, values, (err) => {
                if (err) {
                    return res.sendStatus(500);
                }
                res.sendStatus(201);
                });
            });
    };

    addDrinks(req,res) {
            const drinksImage = req.file ? req.file.filename : null;
            const { drinksName, price, size } = req.body;
            if(!drinksName || !price || !size) return res.sendStatus(400);

            let sql =
            'BEGIN; \
            INSERT INTO DRINKS(drinksName, image) VALUES (?,?);\
            SET @drinksId = LAST_INSERT_ID();\
            INSERT INTO DRINKS_SIZE(drinksId, size, price) VALUES ';
           
            let values = [drinksName, drinksImage];
            for(let i = 0; i < size.length; i++) {
                sql += '(@drinksId, ?, ?),';
                values.push(size[i], price[i]);
            }
            sql = sql.slice(0, -1);
            sql += '; COMMIT;';
            db.query(sql, values, (err) => {
                if (err) {
                    return res.sendStatus(500);
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
}
module.exports = new AdminController();
