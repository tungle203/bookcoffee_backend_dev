const jwt = require('jsonwebtoken');
require('dotenv').config();

const { connection: db} = require('../config/db');
const {handleErrorJWT} = require('../helper/handleErrorHelper');

function verifyToken(req, res, next) {
    const authHeader = req.header('Authorization');
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    const userId = jwt.decode(token).userId;

    const sql = 'SELECT publicKey FROM user WHERE userId = ?';
    db.query(sql, [userId], (err, results) => {
        if (err) return handleErrorDB(err, res);

        const publicKey = results[0].publicKey;

        try {
            const decode = jwt.verify(token, publicKey);
            req.userId = decode.userId;
            req.role = decode.role;
            req.branchId = decode.branchId;
            next();
        } catch (error) {
            return handleErrorJWT(error, res);
        }
    });
}

module.exports = verifyToken;
