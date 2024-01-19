const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const cors = require('cors');
const multer = require('multer');
const morgan = require('morgan');

require('dotenv').config();

const db = require('./config/db');
const verifyToken = require('./middleware/auth');
const { handleErrorDB, handleErrorJWT } = require('./helper/handleErrorHelper');

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, process.env.AVATAR_PATH);
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname);
    },
});

const upload = multer({ storage: storage });

// Body parser
app.use(
    express.urlencoded({
        extended: true,
    }),
);
app.use(express.json());

app.use(morgan('dev'));

app.use(cors());
const generateTokens = (payload) => {
    const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: '10h',
    });
    const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: '24h',
    });

    return { accessToken, refreshToken };
};

const updateRefreshToken = (userId, refreshToken) => {
    const values = [refreshToken, userId];
    const sql = 'UPDATE _USER SET refreshToken = $1 WHERE userId = $2 ';
    db.query(sql, values);
};

app.post('/login', (req, res) => {
    const { userName, password } = req.body;
    if (!userName || !password) return res.sendStatus(400);

    const values = [userName, password];
    const sql =
        'SELECT u.userId as "userId", u.role, u.disable, w.branchId as "branchId", b.address FROM _USER AS u \
        LEFT JOIN _WORK_ON as w \
        ON u.userId = w.staffId \
        LEFT JOIN _BRANCH as b \
        ON w.branchId = b.branchId \
        WHERE u.userName = $1 AND u.password = $2';
    db.query(sql, values, (err, results) => {
        if (err) return handleErrorDB(err, res);
        if (results.rows.length === 0) return res.sendStatus(401);
        if (results.rows[0].disable)
            return res.status(403).send({ message: 'account is disabled' });
        const user = {
            userId: results.rows[0].userId,
            role: results.rows[0].role,
            branchId: results.rows[0].branchId,
        };

        const tokens = generateTokens(user);
        updateRefreshToken(user.userId, tokens.refreshToken);
        res.json({
            ...tokens,
            userName,
            role: user.role,
            branchId: user.branchId,
            branchAddress: results.rows[0].address,
        });
    });
});

app.post('/token', (req, res) => {
    const refreshToken = req.body.refreshToken;
    if (!refreshToken) return res.sendStatus(401);

    const values = [refreshToken];
    const sql = 'SELECT userId, userName FROM _USER WHERE refreshToken = $1';
    db.query(sql, values, (err, results) => {
        if (err) return handleErrorDB(err, res);
        if (results.rows.length === 0)
            return res.status(403).send({ message: 'invalid refreshToken' });

        try {
            const decode = jwt.verify(
                refreshToken,
                process.env.REFRESH_TOKEN_SECRET,
            );
            const user = {
                userId: decode.userId,
                role: decode.role,
                branchId: decode.branchId,
            };
            const tokens = generateTokens(user);
            updateRefreshToken(user.userId, tokens.refreshToken);
            res.json(tokens);
        } catch (error) {
            return handleErrorJWT(error, res);
        }
    });
});

app.post('/logout', verifyToken, (req, res) => {
    updateRefreshToken(req.userId, null);
    res.sendStatus(204);
});

app.post('/signup', upload.single('avatar'), (req, res) => {
    const avatar = req.file ? req.file.filename : null;
    const sql =
        'INSERT INTO _USER(userName, password, email, address, avatar)\
    VALUE ($1, $2, $3, $4, $5)';
    const values = [
        req.body.userName,
        req.body.password,
        req.body.email,
        req.body.address,
        avatar,
    ];

    db.query(sql, values, (err) => {
        if (err) return handleErrorDB(err, res);
        res.sendStatus(201);
    });
});

app.listen(5000, () => {
    console.log(`Auth Server Started at ${5000}`);
});
