const cache = require('../service/cacheService');

function verifyCache(key) {
    return (req, res, next) => {
        if(key === 'book' && cache.has('book') && (req.query.title  || req.query.address)) {
            let books = cache.get('book');
            
            if(req.query.title) {
                books = books.filter(book => book.title.includes(req.query.title));
            }

            // if(req.query.address) {
            //     books.map(book => {
            //         for(let i=0; i<book.branch.length; i++) {
            //             if(book.branch[i] !== req.query.address) {
            //                 book.branch[i] = null;
            //                 book.copyId[i] = null;
            //                 book.isBorrowed[i] = null;
            //             }
            //         }
            //     });
            // }
            if(req.query.address) {
                return next();
            }
            return res.json(books);
        }

        if(cache.has(key)) {
            console.log('cache hit');
            return res.json(cache.get(key));
        }
        console.log('cache miss');
        return next();
    }
}

module.exports = verifyCache;