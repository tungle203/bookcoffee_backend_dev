const staffRouter = require('./staff');
const customerRouter = require('./customer');

function route(app) {
    app.use('/api/staff', staffRouter);
    app.use('/api/customer', customerRouter);
}

module.exports = route;
