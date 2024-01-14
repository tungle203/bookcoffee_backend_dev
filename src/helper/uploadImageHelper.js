const multer = require('multer');

const uploadImage = (imageName, path) => {
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, path);
        },
        filename: function (req, file, cb) {
            cb(null, file.originalname);
        },
    });

    const upload = multer({ storage: storage });

    return function(req, res, next) {
        upload.single(imageName) (req, res, next, (err) => {
            if (err) {
                return res.status(400).json({
                    message: err.message,
                });
            }
            next();
        });
    };
};

module.exports = uploadImage;
