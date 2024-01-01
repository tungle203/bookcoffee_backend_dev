const jwt = require('jsonwebtoken');
require('dotenv').config();

function verifyToken(req, res, next) {
    const authHeader = req.header('Authorization');
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    try {
        const decode = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        req.userId = decode.userId;
        req.role = decode.role;
        req.branchId = decode.branchId;
        next();
    } catch (error) {
        // "message": "expired token"
        // "message": "invalid token"

        if (error.message === 'jwt expired')
            return res.status(403).send({ message: 'expired token' });

        return res.status(403).send({ message: 'invalid token' });
    }
}

module.exports = verifyToken;
