const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const cors = require('cors');
const morgan = require('morgan');

require('dotenv').config();

const { connection: db, connectionPK } = require('./config/db');
const verifyToken = require('./middleware/auth');
const { handleErrorDB, handleErrorJWT } = require('./helper/handleErrorHelper');


// Body parser
app.use(
    express.urlencoded({
        extended: true,
    }),
);
app.use(express.json());

app.use(morgan('dev'));

app.use(cors());

const generateKeyPair = () => {
    const keyPair = crypto.generateKeyPairSync('rsa', {
        modulusLength: 4096,
        publicKeyEncoding: {
            type: 'pkcs1',
            format: 'pem',
        },
        privateKeyEncoding: {
            type: 'pkcs1',
            format: 'pem',
        },
    });

    return keyPair;
};

const updateKeyPair = (userId, publicKey, privateKey) => {
    const sql1 = 'UPDATE user SET publicKey = ? WHERE userId = ? ';
    const sql2 = 'UPDATE PRIVATE_KEY SET privateKey = ? WHERE userId = ? ';
    db.query(sql1, [publicKey, userId]);
    connectionPK.query(sql2, [privateKey, userId]);
}

const generateTokens = (payload, privateKey) => {
    const accessToken = jwt.sign(payload, privateKey, {
        algorithm: 'RS256',
        expiresIn: '2h',
    });
    const refreshToken = jwt.sign(payload, privateKey, {
        algorithm: 'RS256',
        expiresIn: '24h',
    });

    return { accessToken, refreshToken };
};

const updateRefreshToken = (userId, refreshToken) => {
    const values = [refreshToken, userId];
    const sql = 'UPDATE user SET refreshToken = ? WHERE userId = ? ';
    db.query(sql, values);
};

app.post('/login', (req, res) => {
    const { userName, password } = req.body;
    if (!userName || !password) return res.sendStatus(400);

    const values = [userName, password];
    const sql =
        'SELECT u.userId, u.role, u.disable, w.branchId, b.address FROM user AS u \
        LEFT JOIN WORK_ON as w \
        ON u.userId = w.staffId \
        LEFT JOIN BRANCH as b \
        ON w.branchId = b.branchId \
        WHERE u.userName = ? AND u.password = ?';
    db.query(sql, values, (err, results) => {
        if (err) return handleErrorDB(err, res);
        if (results.length === 0) return res.sendStatus(401);
        if (results[0].disable)
            return res.status(403).send({ message: 'account is disabled' });
        const user = {
            userId: results[0].userId,
            role: results[0].role,
            branchId: results[0].branchId,
        };
        const keyPair = generateKeyPair();
        updateKeyPair(user.userId, keyPair.publicKey, keyPair.privateKey);

        const tokens = generateTokens(user, keyPair.privateKey);
        updateRefreshToken(user.userId, tokens.refreshToken);

        res.json({
            ...tokens,
            userName,
            role: user.role,
            branchId: user.branchId,
            branchAddress: results[0].address,
        });
    });
});

app.post('/token', (req, res) => {
    const {refreshToken} = req.body;
    if (!refreshToken) return res.sendStatus(401);

    const values = [refreshToken];
    const sql = 'SELECT publicKey, userId FROM user WHERE refreshToken = ?';
    db.query(sql, values, (err, results) => {
        if (err) return handleErrorDB(err, res);
        if (results.length === 0)
            return res.status(403).send({ message: 'invalid token' });
        const publicKey = results[0].publicKey;
        
        const sql1 = 'SELECT privateKey FROM PRIVATE_KEY WHERE userId = ?';
        connectionPK.query(sql1, [results[0].userId], (err, results) => {
            if (err) return handleErrorDB(err, res);
            if (results.length === 0)
                return res.status(403).send({ message: 'invalid token' });

            const privateKey = results[0].privateKey;

            try {
                const decode = jwt.verify(refreshToken, publicKey);
                const user = {
                    userId: decode.userId,
                    role: decode.role,
                    branchId: decode.branchId,
                };
                const tokens = generateTokens(user, privateKey);

                updateRefreshToken(user.userId, tokens.refreshToken);
                res.json(tokens);
            } catch (error) {
                return handleErrorJWT(error, res);
            }

        });
    });
});

app.post('/logout', verifyToken, (req, res) => {
    updateRefreshToken(req.userId, null);
    updatePublicKey(req.userId, null);
    res.sendStatus(204);
});

app.post('/signup', (req, res) => {
    const sql =
        'INSERT INTO user(userName, password, email, address)\
    VALUE (?,?,?,?)';
    const values = [
        req.body.userName,
        req.body.password,
        req.body.email,
        req.body.address
    ];

    db.query(sql, values, (err) => {
        if (err) return handleErrorDB(err, res);
        res.sendStatus(201);
    });
});

app.listen(5000, () => {
    console.log(`Auth Server Started at ${5000}`);
});
