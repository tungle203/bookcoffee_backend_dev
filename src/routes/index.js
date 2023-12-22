const staffRouter = require('./staff');
const customerRouter = require('./customer');
const adminRouter = require('./admin');
const managerRouter = require('./manager');

function route(app) {
    app.use('/api/staff', staffRouter);
    app.use('/api/customer', customerRouter);
    app.use('/api/admin', adminRouter);
    app.use('/api/manager', managerRouter);
}

module.exports = route;
