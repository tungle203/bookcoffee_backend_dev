const express = require('express');
const app = express();
const cors = require('cors');

const db = require('./config/db');
const route = require('./routes');

// Connect DB
// db.connect((err) => {
//     if (err) throw err;
//     console.log('Mysql Connected...');
// });
// Body parser
app.use(
    express.urlencoded({
        extended: true,
    }),
);
app.use(express.json());

app.use(cors());

route(app);

app.listen(4000, () => {
    console.log(`Server Started at ${4000}`);
});
