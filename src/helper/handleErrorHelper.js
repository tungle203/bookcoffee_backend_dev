const handleErrorDB = (error, res) => {
    // return status code and error message using switch case
    
    switch (error.code) {
        case 'ER_DUP_ENTRY':
            return res.status(409).send({ message: 'username already exists' });
        default:
            return res.status(500).send({ message: 'internal server error' });
    }
};

const handleErrorJWT = (error, res) => {
    // return status code and error message using switch case
    switch (error.message) {
        case 'jwt expired':
            return res.status(403).send({ message: 'expired token' });
        default:
            return res.status(403).send({ message: 'invalid token' });
    }
};

module.exports = { handleErrorDB, handleErrorJWT };