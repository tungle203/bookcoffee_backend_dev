const staffRouter = require('./staff');

function route(app) {
    app.use('/api/staff', staffRouter);
}

module.exports = route;
