const express = require('express');
const app = express();

const db = require('./config/db');
const route = require('./routes');

// Connect DB
db.connect((err) => {
    if (err) throw err;
    console.log('Mysql Connected...');
});
// Body parser
app.use(
    express.urlencoded({
        extended: true,
    }),
);
app.use(express.json());

route(app);

app.listen(3000, () => {
    console.log(`Server Started at ${3000}`);
});
