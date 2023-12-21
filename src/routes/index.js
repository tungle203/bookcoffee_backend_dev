const staffRouter = require('./staff');
const customerRouter = require('./customer');
const adminRouter = require('./admin');

function route(app) {
    app.use('/api/staff', staffRouter);
    app.use('/api/customer', customerRouter);
    app.use('/api/admin', adminRouter);
}

module.exports = route;
