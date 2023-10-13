const express = require('express');
const jwt = require('jsonwebtoken');
const app = express();
require('dotenv').config();

const db = require('./config/db');
const verifyToken = require('./middleware/auth');

// Connect DB
db.connect((err) => {
    if (err) throw err;
    console.log('Mysql Connected...');
});
// Body parser
app.use(
    express.urlencoded({
        extended: true,
    }),
);
app.use(express.json());

const generateTokens = (payload) => {
    const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '5m',
    });
    const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: '1h',
    });

    return { accessToken, refreshToken };
};

const updateRefreshToken = (user_id, refreshToken) => {
    const values = [refreshToken, user_id];
    const sql = 'UPDATE User SET refresh_token = ? WHERE user_id = ? ';
    const query = db.query(sql, values);
};

app.post('/login', (req, res) => {
    const { userName, password } = req.body;
    const values = [userName, password];
    const sql =
        'SELECT user_id, role FROM user WHERE user_name = ? && password = ?';
    const query = db.query(sql, values, (err, results) => {
        if (err || results.length === 0)
            return res.sendStatus(401);

        const user = {
            userId: results[0].user_id,
            role: results[0].role,
        };
        const tokens = generateTokens(user);
        updateRefreshToken(user.userId, tokens.refreshToken);
        res.json(tokens);
    });
});

app.post('/token', (req, res) => {
    const refreshToken = req.body.refreshToken;
    if (!refreshToken) return res.sendStatus(401);

    const values = [refreshToken];
    const sql = 'SELECT user_id, user_name FROM user WHERE refresh_token = ?';
    const query = db.query(sql, values, (err, results) => {
        if (err || results.length === 0)
            return res.sendStatus(401);
        const user = {
            userId: results[0].user_id,
            userName: results[0].user_name,
        };
        try {
            jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
            const tokens = generateTokens(user);
            updateRefreshToken(user.userId, tokens.refreshToken);
            res.json(tokens);
        } catch (error) {
            console.log(error);
            res.sendStatus(403);
        }
    });
});

app.post('/logout', verifyToken, (req, res) => {
    updateRefreshToken(req.userId, null);
    res.sendStatus(204);
});

app.listen(5000, () => {
    console.log(`Server Started at ${5000}`);
});
