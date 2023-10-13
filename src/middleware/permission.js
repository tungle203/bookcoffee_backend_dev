function verifyPermission(roles) {
    return function(req, res, next) {
        if(roles.includes(req.role)) return next();
        res.sendStatus(403)
    }
}

module.exports = verifyPermission;