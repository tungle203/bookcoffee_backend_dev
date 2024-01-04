const multer = require('multer');

const uploadImage = (imageName, path) => {
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, path)
        },
        filename: function (req, file, cb) {
            cb(null, file.originalname)
        }
    });
    
    const upload = multer({ storage: storage });

    return upload.single(imageName);
}

module.exports = uploadImage;