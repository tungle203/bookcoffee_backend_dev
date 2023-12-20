const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const cors = require('cors')
require('dotenv').config();

const db = require('./config/db');
const verifyToken = require('./middleware/auth');

// Connect DB
// db.connect((err) => {
//     if (err) throw err;
//     console.log('Mysql Connected...');
// });
// Body parser
app.use(
    express.urlencoded({
        extended: true,
    }),
);
app.use(express.json());

app.use(cors())
const generateTokens = (payload) => {
    const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '5m',
    });
    const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: '1h',
    });

    return { accessToken, refreshToken };
};

const updateRefreshToken = (userId, refreshToken) => {
    const values = [refreshToken, userId];
    const sql = 'UPDATE User SET refreshToken = ? WHERE userId = ? ';
    db.query(sql, values);
};

app.post('/login', (req, res) => {
    const { userName, password } = req.body;
    if(!userName || !password) return res.sendStatus(400)

    const values = [userName, password];
    const sql =
        'SELECT userId, role FROM user WHERE userName = ? && password = ?';
    db.query(sql, values, (err, results) => {
        if (err || results.length === 0) return res.sendStatus(401);

        const user = {
            userId: results[0].userId,
            role: results[0].role,
        };
        const tokens = generateTokens(user);
        updateRefreshToken(user.userId, tokens.refreshToken);
        res.json({ ...tokens, userName, role: user.role });
    });
});

app.post('/token', (req, res) => {
    const refreshToken = req.body.refreshToken;
    if (!refreshToken) return res.sendStatus(401);

    const values = [refreshToken];
    const sql = 'SELECT userId, userName FROM user WHERE refreshToken = ?';
    db.query(sql, values, (err, results) => {
        if (err) return res.sendStatus(500);
        if(results.length === 0 ) return res.status(403).send({ message: "invalid refreshToken" });
        const user = {
            userId: results[0].userId,
            userName: results[0].userName,
        };
        try {
            jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
            const tokens = generateTokens(user);
            updateRefreshToken(user.userId, tokens.refreshToken);
            res.json(tokens);
        } catch (error) {
            if(error.message === 'jwt expired')
                return res.status(403).send({ message: "expired refreshToken" });

            return res.status(403).send({ message: "invalid refreshToken" });
        }
    });
});

app.post('/logout', verifyToken, (req, res) => {
    updateRefreshToken(req.userId, null);
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
        req.body.address,
    ];

    db.query(sql, values, (err) => {
        if (err) {
            return res.sendStatus(409);
        }
        res.sendStatus(201);
    });
});

app.listen(5000, () => {
    console.log(`Auth Server Started at ${5000}`);
});
