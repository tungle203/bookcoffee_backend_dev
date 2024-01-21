const cache = require('../service/cacheService');

function verifyCache(key) {
    return (req, res, next) => {
        if (
            key === 'book' &&
            cache.has('book') &&
            (req.query.title || req.query.address || req.query.genre)
        ) {
            let books = cache.get('book');

            if (req.query.genre) {
                books = books.filter((book) => book.genre === req.query.genre);
            }

            if (req.query.title) {
                books = books.filter(
                    (book) =>
                        book.title.includes(req.query.title) ||
                        book.authorName.includes(req.query.title),
                );
            }

            if (req.query.address) {
                books = books.filter((book) => {
                    if (!book.branch.includes(req.query.address)) {
                        return false;
                    }

                    for (let i = 0; i < book.branch.length; i++) {
                        if (book.branch[i] !== req.query.address) {
                            book.branch.splice(i, 1);
                            book.copyId.splice(i, 1);
                            book.isBorrowed.splice(i, 1);
                            i--;
                        }
                    }
                    return true;
                });
            }
            return res.json(books);
        }

        // key is not book
        if (cache.has(key)) {
            return res.json(cache.get(key));
        }
        return next();
    };
}

module.exports = verifyCache;
